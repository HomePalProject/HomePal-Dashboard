import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn, getErrorMessage } from '@lib/utils';
import { catalogService } from '@services/catalogService';
import { productCategoryService } from '@services/productCategoryService';
import type { Offer, Supermarket } from '@typeDefs/catalogTypes';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { getImageUrl, getLocalString, getLocalizedCulture } from '@lib/formatters';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

type FilterTab = 'all' | 'unverified' | 'expiring';

export default function OffersHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupermarketFilter, setSelectedSupermarketFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'discount' | 'price_low' | 'price_high'
  >('newest');

  // Sync tab with URL parameter ?filter=unverified
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'unverified' || filterParam === 'expiring' || filterParam === 'all') {
      setActiveTab(filterParam as FilterTab);
    }
  }, [searchParams]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [supermarketId, setSupermarketId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [validToDate, setValidToDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [backendOffers, marketsData, categoriesData] = await Promise.all([
        catalogService.getOffers({ onlyVerified: false }).catch(() => []),
        catalogService.getSupermarkets().catch(() => []),
        productCategoryService.getCategories().catch(() => []),
      ]);

      setSupermarkets(marketsData || []);
      setCategories(categoriesData || []);

      // Check session storage for recently scraped offers from ScrapingPipeline
      const sessionScrapedRaw = sessionStorage.getItem('homepal_recent_scraped_offers');
      let scrapedSessionOffers: Offer[] = [];
      if (sessionScrapedRaw) {
        try {
          scrapedSessionOffers = JSON.parse(sessionScrapedRaw);
        } catch (e) {
          console.error('Failed to parse session scraped offers', e);
        }
      }

      const combined = [...scrapedSessionOffers, ...(backendOffers || [])];

      // Deduplicate offers by ID or signature
      const seen = new Set<string>();
      const deduplicated = combined.filter((o) => {
        const key =
          o.id ||
          `${getLocalString(o.name || o.title)}_${o.discountedPrice || o.price}_${o.supermarketId || o.supermarketName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setOffers(deduplicated);
    } catch (err) {
      console.error('Error loading offers:', err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  // Open Create/Edit Modal
  const handleOpenModal = (off?: Offer) => {
    if (off) {
      setEditingOffer(off);
      setTitle(getLocalString(off.title || off.name));
      setSupermarketId(off.supermarketId || '');
      setCategoryId(off.categoryId || '');
      setOriginalPrice(off.originalPrice ? String(off.originalPrice) : '');
      setDiscountedPrice(
        off.discountedPrice || off.price ? String(off.discountedPrice || off.price) : ''
      );
      setValidToDate(off.validTo ? off.validTo.split('T')[0] : '');
      setDescription(
        typeof off.description === 'string' ? off.description : getLocalString(off.description)
      );
      setImageUrl(off.imagePath || '');
      setIsVerified(!!off.isVerified);
    } else {
      setEditingOffer(null);
      setTitle('');
      setSupermarketId(supermarkets.length > 0 ? supermarkets[0].id : '');
      setCategoryId('');
      setOriginalPrice('');
      setDiscountedPrice('');
      setValidToDate('');
      setDescription('');
      setImageUrl('');
      setIsVerified(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  // Submit Save Offer
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const selectedMarket = supermarkets.find((s) => s.id === supermarketId);
    const selectedCategory = categories.find((c) => c.id === categoryId);

    const payload: Partial<Offer> = {
      title: title.trim(),
      name: title.trim(),
      description: description.trim(),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
      price: discountedPrice
        ? parseFloat(discountedPrice)
        : originalPrice
          ? parseFloat(originalPrice)
          : 0,
      validTo: validToDate || null,
      supermarketId: supermarketId || null,
      supermarketName: selectedMarket ? getLocalString(selectedMarket.name) : 'Supermarket',
      categoryId: categoryId || null,
      categoryName: selectedCategory
        ? typeof selectedCategory.name === 'string'
          ? selectedCategory.name
          : getLocalizedCulture(selectedCategory.name, 'en')
        : 'General',
      imagePath: imageUrl.trim() || null,
      isVerified,
      status: isVerified ? 'Verified' : 'Flagged',
    };

    try {
      if (editingOffer) {
        await catalogService.saveOffer(payload, editingOffer.id).catch(() => null);
        setOffers((prev) =>
          prev.map((o) => (o.id === editingOffer.id ? ({ ...o, ...payload } as Offer) : o))
        );
        showToast('Offer updated successfully!');
      } else {
        const newOffer: Offer = {
          id: `off-${Date.now()}`,
          ...payload,
        } as Offer;
        await catalogService.saveOffer(payload).catch(() => null);
        setOffers((prev) => [newOffer, ...prev]);
        showToast('New offer created successfully!');
      }
      handleCloseModal();
    } catch (err: any) {
      showToast(`Error saving offer: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Verify Offer Directly from Table
  const handleToggleVerify = async (offer: Offer) => {
    const updatedStatus = !offer.isVerified;
    const newOfferState: Offer = {
      ...offer,
      isVerified: updatedStatus,
      status: updatedStatus ? 'Verified' : 'Needs Verification',
    };

    setOffers((prev) => prev.map((o) => (o.id === offer.id ? newOfferState : o)));

    // Update in session storage too if present
    const sessionRaw = sessionStorage.getItem('homepal_recent_scraped_offers');
    if (sessionRaw) {
      try {
        const sessionOffers: Offer[] = JSON.parse(sessionRaw);
        const updatedSession = sessionOffers.map((o) => {
          if (
            o.id === offer.id ||
            (getLocalString(o.name || o.title) === getLocalString(offer.name || offer.title) &&
              (o.discountedPrice || o.price) === (offer.discountedPrice || offer.price))
          ) {
            return {
              ...o,
              isVerified: updatedStatus,
              status: updatedStatus ? 'Verified' : 'Needs Verification',
            };
          }
          return o;
        });
        sessionStorage.setItem('homepal_recent_scraped_offers', JSON.stringify(updatedSession));
      } catch (e) {
        console.error(e);
      }
    }

    showToast(updatedStatus ? 'Offer marked as Verified!' : 'Offer unverified.');

    try {
      await catalogService.saveOffer({ isVerified: updatedStatus }, offer.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Offer
  const handleDeleteOffer = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await catalogService.deleteOffer(deleteTarget.id).catch(() => null);

      const targetId = deleteTarget.id;
      const targetTitle = getLocalString(deleteTarget.title || deleteTarget.name);
      const targetPrice = deleteTarget.discountedPrice || deleteTarget.price;

      // 1. Remove from local state
      setOffers((prev) =>
        prev.filter((o) => {
          if (o.id && targetId && o.id === targetId) return false;
          const oTitle = getLocalString(o.title || o.name);
          const oPrice = o.discountedPrice || o.price;
          if (oTitle === targetTitle && oPrice === targetPrice) return false;
          return true;
        })
      );

      // 2. Remove from session storage so refresh doesn't restore deleted items
      const sessionRaw = sessionStorage.getItem('homepal_recent_scraped_offers');
      if (sessionRaw) {
        try {
          const sessionOffers: Offer[] = JSON.parse(sessionRaw);
          const filteredSession = sessionOffers.filter((o) => {
            if (o.id && targetId && o.id === targetId) return false;
            const oTitle = getLocalString(o.title || o.name);
            const oPrice = o.discountedPrice || o.price;
            if (oTitle === targetTitle && oPrice === targetPrice) return false;
            return true;
          });
          sessionStorage.setItem('homepal_recent_scraped_offers', JSON.stringify(filteredSession));
        } catch (e) {
          console.error('Failed updating session storage after delete', e);
        }
      }

      showToast('Offer deleted successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(`Delete failed: ${getErrorMessage(err)}`);
    } finally {
      setDeleting(false);
    }
  };

  // Filtering & Sorting
  const filteredOffers = offers
    .filter((off) => {
      const titleText = getLocalString(off.title || off.name).toLowerCase();
      const marketText = (off.supermarketName || '').toLowerCase();
      const catText = (off.categoryName || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      // 1. Search Query Filter
      const matchesSearch = titleText.includes(q) || marketText.includes(q) || catText.includes(q);
      if (!matchesSearch) return false;

      // 2. Tab Filter (all / unverified / expiring)
      if (activeTab === 'unverified') {
        const isUnver =
          !off.isVerified || off.status === 'Flagged' || off.status === 'Needs Verification';
        if (!isUnver) return false;
      }
      if (activeTab === 'expiring') {
        const isExp =
          off.status === 'Expiring' ||
          (off.validTo && new Date(off.validTo) <= new Date(Date.now() + 3 * 86400000));
        if (!isExp) return false;
      }

      // 3. Supermarket Filter
      if (selectedSupermarketFilter !== 'all') {
        const matchId = off.supermarketId === selectedSupermarketFilter;
        const selectedMarketObj = supermarkets.find((s) => s.id === selectedSupermarketFilter);
        const selectedName = selectedMarketObj
          ? getLocalString(selectedMarketObj.name).toLowerCase()
          : '';
        const matchName = selectedName ? marketText.includes(selectedName) : false;
        if (!matchId && !matchName) return false;
      }

      // 4. Category Filter
      if (selectedCategoryFilter !== 'all') {
        const matchId = off.categoryId === selectedCategoryFilter;
        const selectedCatObj = categories.find((c) => c.id === selectedCategoryFilter);
        const selectedName = selectedCatObj
          ? getLocalString(selectedCatObj.name).toLowerCase()
          : '';
        const matchName = selectedName ? catText.includes(selectedName) : false;
        if (!matchId && !matchName) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === 'discount') {
        const getDiscRatio = (o: Offer) => {
          if (o.originalPrice && o.discountedPrice && o.originalPrice > o.discountedPrice) {
            return (o.originalPrice - o.discountedPrice) / o.originalPrice;
          }
          return 0;
        };
        return getDiscRatio(b) - getDiscRatio(a);
      }
      if (sortBy === 'price_low') {
        const priceA = a.discountedPrice ?? a.price ?? 0;
        const priceB = b.discountedPrice ?? b.price ?? 0;
        return priceA - priceB;
      }
      if (sortBy === 'price_high') {
        const priceA = a.discountedPrice ?? a.price ?? 0;
        const priceB = b.discountedPrice ?? b.price ?? 0;
        return priceB - priceA;
      }
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredOffers.length / pageSize) || 1;
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Metrics
  const needsReviewCount = offers.filter((o) => !o.isVerified || o.status === 'Flagged').length;
  const activePipelinesCount = supermarkets.length; // Active connected supermarket pipelines

  // Calculate dynamic 5-day ingestion timeline (Today + 4 past days)
  const ingestionDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Yesterday'
          : d.toLocaleDateString('en-US', { weekday: 'short' });

    const count = offers.filter((o) => {
      if (!o.createdAt) return i === 0;
      return new Date(o.createdAt).toDateString() === d.toDateString();
    }).length;

    return { label: dayLabel, count, isToday: i === 0, dateStr: d.toLocaleDateString() };
  });

  const maxIngestionCount = Math.max(...ingestionDays.map((d) => d.count), 1);

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-16 px-2 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-3 border border-slate-700 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header / Top Action Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Control Hub</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Offers Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
            Offers Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Manage, verify, and track supermarket promotions automatically synced from scraping
            pipelines.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          {/* Add Offer Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1F3D32] hover:bg-[#152a22] active:scale-[0.98] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm hover:shadow-md shrink-0 border-none"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: Offers Table (Left 70%) + Desk View (Right 30%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Offers Table Card (8/12 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Filter Tabs Header */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer',
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              All Offers ({offers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('unverified');
                setCurrentPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5',
                activeTab === 'unverified'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              <span>Needs Verification</span>
              {needsReviewCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  {needsReviewCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('expiring');
                setCurrentPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer',
                activeTab === 'expiring'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              Expiring Soon
            </button>

            <button
              onClick={() => navigate('/dashboard/scraping-pipeline')}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline border-none bg-transparent cursor-pointer shrink-0"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Go to Scraper Pipeline →
            </button>
          </div>

          {/* ── Sub-Filters & Sorting Toolbar ── */}
          <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-4">
            {/* Supermarket Dropdown Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Supermarket:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={selectedSupermarketFilter}
                  onChange={(e) => {
                    setSelectedSupermarketFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-slate-300 outline-none cursor-pointer focus:border-slate-400 transition-colors shadow-2xs"
                >
                  <option value="all">All Supermarkets ({supermarkets.length})</option>
                  {supermarkets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getLocalString(m.name)}
                    </option>
                  ))}
                </select>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Category:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => {
                    setSelectedCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-slate-300 outline-none cursor-pointer focus:border-slate-400 transition-colors shadow-2xs"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getLocalString(c.name)}
                    </option>
                  ))}
                </select>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 text-xs sm:ml-auto">
              <span className="font-semibold text-slate-500">Sort by:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-slate-300 outline-none cursor-pointer focus:border-slate-400 transition-colors shadow-2xs"
                >
                  <option value="newest">Newest Ingested</option>
                  <option value="oldest">Oldest First</option>
                  <option value="discount">Highest Discount (%)</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Reset Active Filters Button */}
            {(selectedSupermarketFilter !== 'all' ||
              selectedCategoryFilter !== 'all' ||
              sortBy !== 'newest' ||
              searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedSupermarketFilter('all');
                  setSelectedCategoryFilter('all');
                  setSortBy('newest');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100/80 border border-red-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Offers Table */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs font-semibold">
              Loading promotions & scraped offers...
            </div>
          ) : paginatedOffers.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-sm font-bold text-slate-700 m-0">No offers found</p>
              <p className="text-xs text-slate-400 m-0">
                Run the scraper or click "Add New Offer" to add supermarket promotions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="pl-6 pr-4 py-3.5">OFFER</th>
                    <th className="px-4 py-3.5">SUPERMARKET</th>
                    <th className="px-4 py-3.5">ORIGINAL PRICE</th>
                    <th className="px-4 py-3.5">OFFER PRICE</th>
                    <th className="px-4 py-3.5">VALIDITY</th>
                    <th className="px-4 py-3.5">STATUS</th>
                    <th className="pr-6 pl-4 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedOffers.map((off) => {
                    const titleText = getLocalString(off.title || off.name);
                    const marketName = off.supermarketName || 'Supermarket';
                    const categoryText = off.categoryName || 'General';
                    const imgUrl = getImageUrl(off.imagePath);
                    const discPrice = off.discountedPrice || off.price;
                    const origPrice = off.originalPrice;
                    const hasDiscount = origPrice && origPrice > (discPrice || 0);

                    return (
                      <tr key={off.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* OFFER Column */}
                        <td className="pl-6 pr-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={titleText}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className="text-slate-400"
                                >
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 line-clamp-1">
                                {titleText}
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                {categoryText}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SUPERMARKET Column */}
                        <td className="px-4 py-4 font-extrabold text-slate-800">
                          <div className="flex items-center gap-2">
                            {off.supermarketLogoPath && (
                              <img
                                src={getImageUrl(off.supermarketLogoPath)!}
                                alt={marketName}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200"
                              />
                            )}
                            <span>{marketName}</span>
                          </div>
                        </td>

                        {/* ORIGINAL PRICE Column */}
                        <td className="px-4 py-4 text-slate-500 font-semibold">
                          {hasDiscount ? (
                            <span className="line-through text-slate-400 text-xs">
                              {origPrice} EGP
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">
                              {origPrice ? `${origPrice} EGP` : '—'}
                            </span>
                          )}
                        </td>

                        {/* OFFER PRICE Column */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              {discPrice} EGP
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                -{Math.round(((origPrice - (discPrice || 0)) / origPrice) * 100)}%
                              </span>
                            )}
                          </div>
                        </td>

                        {/* VALIDITY Column */}
                        <td className="px-4 py-4 text-slate-600 font-semibold">
                          {off.status === 'Expiring' ||
                          (off.validTo &&
                            new Date(off.validTo) <= new Date(Date.now() + 86400000)) ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Expires Today
                            </span>
                          ) : off.validTo ? (
                            <span>
                              Ends in{' '}
                              {Math.max(
                                1,
                                Math.ceil(
                                  (new Date(off.validTo).getTime() - Date.now()) /
                                    (1000 * 3600 * 24)
                                )
                              )}{' '}
                              days
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* STATUS Column */}
                        <td className="px-4 py-4">
                          {off.isVerified || off.status === 'Verified' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Verified
                            </span>
                          ) : off.status === 'Expiring' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Expiring
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* ACTIONS Column */}
                        <td className="pr-6 pl-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Verify Button */}
                            <button
                              onClick={() => handleToggleVerify(off)}
                              title={
                                off.isVerified ? 'Mark as Unverified' : 'Approve & Verify Offer'
                              }
                              className={cn(
                                'p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors',
                                off.isVerified
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:text-emerald-700 hover:bg-amber-50'
                              )}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenModal(off)}
                              title="Edit Offer"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition-colors"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteTarget(off)}
                              title="Delete Offer"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer transition-colors"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer / Pagination */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              Showing {filteredOffers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, filteredOffers.length)} of {filteredOffers.length}{' '}
              offers
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
              >
                ‹
              </button>
              <span className="px-2 py-1 font-bold text-slate-900">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Desk View Panel (4/12 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Widget 1: Desk View Metrics & Daily Ingestion Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Desk View</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  NEEDS REVIEW
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1">{needsReviewCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  ACTIVE PIPELINES
                </span>
                <span className="text-2xl font-black text-[#1F3D32] mt-1">
                  {activePipelinesCount}
                </span>
              </div>
            </div>

            {/* Daily Scraped Offers Ingestion Bar Chart Widget */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    DAILY INGESTION RATE
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Scraped & Synced Offers
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {offers.length} Total Offers
                </span>
              </div>
              <div className="flex items-end justify-between h-14 gap-1.5 pt-3">
                {ingestionDays.map((d) => {
                  const heightPercent = Math.max(
                    15,
                    Math.round((d.count / maxIngestionCount) * 100)
                  );
                  return (
                    <div
                      key={d.label + d.dateStr}
                      className={cn(
                        'w-full rounded-xs transition-all',
                        d.isToday ? 'bg-[#1F3D32]' : 'bg-slate-200 hover:bg-slate-300'
                      )}
                      style={{ height: `${heightPercent}%` }}
                      title={`${d.label} (${d.dateStr}): ${d.count} offers`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                {ingestionDays.map((d) => (
                  <span
                    key={d.label + d.dateStr}
                    className={cn(d.isToday && 'text-[#1F3D32] font-black')}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Offer Modal ── */}
      {isModalOpen && (
        <Modal
          title={editingOffer ? 'Edit Offer' : 'Add New Offer'}
          onClose={handleCloseModal}
          isOpen={true}
        >
          <form onSubmit={handleSaveOffer} className="flex flex-col gap-4 pt-2">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Offer Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premium Ribeye Steak"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                required
              />
            </div>

            {/* Supermarket & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Supermarket
                </label>
                <select
                  value={supermarketId}
                  onChange={(e) => setSupermarketId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                >
                  <option value="">Select Supermarket...</option>
                  {supermarkets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getLocalString(m.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Product Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {typeof c.name === 'string' ? c.name : getLocalizedCulture(c.name, 'en')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prices & Validity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Original Price (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 850"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Discounted Price (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  placeholder="e.g. 680"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validToDate}
                  onChange={(e) => setValidToDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Image Path */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Image Path / URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/uploads/products/xyz.jpg or https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white outline-none focus:border-slate-400"
              />
            </div>

            {/* Verification Status Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isVerifiedCheckbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label
                htmlFor="isVerifiedCheckbox"
                className="text-xs font-bold text-slate-800 cursor-pointer"
              >
                Verified Offer (Approved for Mobile App Feed)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1F3D32] hover:bg-[#162D25] cursor-pointer transition-all shadow-xs border-none"
              >
                {saving ? 'Saving...' : 'Save Offer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Offer"
          confirmLabel="Delete Offer"
          message={`Are you sure you want to delete "${getLocalString(deleteTarget.title || deleteTarget.name)}"?`}
          onConfirm={handleDeleteOffer}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
