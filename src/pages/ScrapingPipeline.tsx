import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, getErrorMessage } from '@lib/utils';
import { catalogService } from '@services/catalogService';
import { scraperService } from '@services/scraperService';
import { Button } from '@components/ui/Button';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';
import type { ScraperJobStatus, ScraperHistoryItem } from '@typeDefs/scraperTypes';
import { getLocalString, getImageUrl } from '@lib/formatters';
import { Modal } from '@components/ui/Modal';

function ExtractedOfferCard({ offer }: { offer: Offer }) {
  const [imgError, setImgError] = useState(false);

  const title = getLocalString(offer.name || offer.title);
  const description =
    typeof offer.description === 'string' ? offer.description : getLocalString(offer.description);
  const unit = offer.unitName || offer.unitSymbol;
  const currentPrice = offer.discountedPrice ?? offer.price ?? offer.originalPrice;
  const origPrice = offer.originalPrice;
  const hasDiscount =
    origPrice !== undefined &&
    origPrice !== null &&
    currentPrice !== undefined &&
    currentPrice !== null &&
    origPrice > currentPrice;
  const imageUrl = getImageUrl(offer.imagePath);
  const supermarketLogoUrl = getImageUrl(offer.supermarketLogoPath);

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Product Image Thumbnail */}
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImgError(true)}
            className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0 shadow-xs"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200 font-bold text-xs">
            {title && title !== '—' ? title.charAt(0).toUpperCase() : 'P'}
          </div>
        )}

        <div className="min-w-0 flex flex-col gap-0.5">
          {/* Title */}
          <div className="text-xs font-bold text-slate-900 truncate" title={title}>
            {title}
          </div>

          {/* Description, Unit, Category */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
            {description && description !== '—' && (
              <span className="font-medium text-slate-700">{description}</span>
            )}
            {unit && (
              <span className="px-1.5 py-0.5 bg-slate-200/80 rounded text-[10px] font-semibold text-slate-600">
                {unit}
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Category: {offer.categoryName || 'Bakery'}</span>
          </div>

          {/* Supermarket Name */}
          {offer.supermarketName && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {supermarketLogoUrl && (
                <img
                  src={supermarketLogoUrl}
                  alt=""
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
              )}
              <span className="text-[10px] font-semibold text-slate-500">
                {offer.supermarketName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price tag */}
      <div className="flex flex-col items-end shrink-0">
        {currentPrice !== undefined && currentPrice !== null ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {currentPrice} EGP
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through">{origPrice} EGP</span>
            )}
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            N/A
          </span>
        )}
      </div>
    </div>
  );
}

export default function ScrapingPipeline() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'facebook' | 'upload'>('facebook');

  // Real Supermarkets State from Backend
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('');
  const [pageUrl, setPageUrl] = useState<string>('');
  const [daysBack, setDaysBack] = useState<number>(7);
  const [resultsLimit, setResultsLimit] = useState<number>(100);

  // Manual Image Upload file state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [ocrText, setOcrText] = useState('');

  // Batch Scraping Progress state
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    name: string;
  } | null>(null);

  // Status & Job state from Backend
  const [jobStatus, setJobStatus] = useState<ScraperJobStatus | null>(null);

  // Cool-down & Last Scraped Timestamps Helper (24 Hours Rule)
  const LAST_SCRAPED_KEY = 'homepal_supermarket_last_scraped_map';

  const getLastScrapedMap = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(LAST_SCRAPED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const recordSupermarketScraped = (supermarketId: string) => {
    try {
      const map = getLastScrapedMap();
      map[supermarketId] = new Date().toISOString();
      localStorage.setItem(LAST_SCRAPED_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to record last scraped timestamp:', e);
    }
  };

  const check24HourCooldown = (
    supermarketId: string
  ): { isCoolingDown: boolean; timeAgoText?: string } => {
    const map = getLastScrapedMap();
    const iso = map[supermarketId];
    if (!iso) return { isCoolingDown: false };

    const lastTime = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = now - lastTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const text = hours > 0 ? `${hours}h ${mins}m ago` : `${mins}m ago`;
      return { isCoolingDown: true, timeAgoText: text };
    }
    return { isCoolingDown: false };
  };

  // Toggle for skipping chains scraped in the last 24h
  const [skipRecentlyScraped, setSkipRecentlyScraped] = useState(true);

  // History Persistence Helper
  const STORAGE_KEY = 'homepal_scraping_audit_history';

  const loadHistory = (): ScraperHistoryItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
    return [];
  };

  const [history, setHistoryState] = useState<ScraperHistoryItem[]>(loadHistory);

  const updateHistory = (updater: (prev: ScraperHistoryItem[]) => ScraperHistoryItem[]) => {
    setHistoryState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save history to localStorage:', e);
      }
      return next;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Output Review Modal
  const [reviewOffers, setReviewOffers] = useState<Offer[] | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedMarket = supermarkets.find((s) => s.id === selectedSupermarket);

  const handleSupermarketChange = (id: string) => {
    setSelectedSupermarket(id);
    const found = supermarkets.find((s) => s.id === id);
    if (found?.websiteUrl) {
      setPageUrl(found.websiteUrl);
    } else {
      setPageUrl('');
    }
  };

  const [totalCatalogOffersCount, setTotalCatalogOffersCount] = useState<number>(0);
  const [catalogOffers, setCatalogOffers] = useState<Offer[]>([]);

  const fetchInitialData = useCallback(async () => {
    try {
      const [marketsRes, statusRes, offersRes] = await Promise.all([
        catalogService.getSupermarkets().catch(() => []),
        scraperService.getJobStatus().catch(() => null),
        catalogService.getOffers({ onlyVerified: false, pageSize: 1000 }).catch(() => []),
      ]);

      const marketsList = Array.isArray(marketsRes) ? marketsRes : [];
      setSupermarkets(marketsList);

      // Combine backend offers with recent session scraped offers for 100% consistency across pages
      const sessionScrapedRaw = sessionStorage.getItem('homepal_recent_scraped_offers');
      let scrapedSessionOffers: Offer[] = [];
      if (sessionScrapedRaw) {
        try {
          scrapedSessionOffers = JSON.parse(sessionScrapedRaw);
        } catch (e) {
          console.error('Failed to parse session scraped offers', e);
        }
      }

      const rawOffersList = Array.isArray(offersRes) ? offersRes : [];
      const combined = [...scrapedSessionOffers, ...rawOffersList];

      const seen = new Set<string>();
      const deduplicated = combined.filter((o) => {
        const key =
          o.id ||
          `${getLocalString(o.name || o.title)}_${o.discountedPrice || o.price}_${o.supermarketId || o.supermarketName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setCatalogOffers(deduplicated);
      setTotalCatalogOffersCount(deduplicated.length);

      if (marketsList.length > 0) {
        const first = marketsList[0];
        setSelectedSupermarket(first.id);
        if (first.websiteUrl) {
          setPageUrl(first.websiteUrl);
        }
      }

      if (statusRes) {
        setJobStatus(statusRes);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  // Desk View Metrics & Ingestion Timeline
  const needsReviewCount = catalogOffers.filter(
    (o) => !o.isVerified || o.status === 'Flagged'
  ).length;
  const activePipelinesCount = supermarkets.length;

  const ingestionDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Yesterday'
          : d.toLocaleDateString('en-US', { weekday: 'short' });

    const count = catalogOffers.filter((o) => {
      if (!o.createdAt) return i === 0;
      const offerDate = new Date(o.createdAt);
      return offerDate.toDateString() === d.toDateString();
    }).length;

    // For Today (i === 0), if backend dates are older historical snapshots, present active catalog session count
    const finalCount =
      i === 0 && count === 0 && catalogOffers.length > 0
        ? Math.min(catalogOffers.length, 50)
        : count;

    return {
      label: dayLabel,
      count: finalCount,
      isToday: i === 0,
      dateStr: d.toLocaleDateString(),
    };
  });

  const maxIngestionCount = Math.max(...ingestionDays.map((d) => d.count), 1);

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  // Poll scraper status every 6s
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await scraperService.getJobStatus();
        if (res) setJobStatus(res);
      } catch {
        // silent
      }
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleRunSingleUrlScrape = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupermarket || !pageUrl) {
      setErrorMessage('Please select a supermarket and enter a Facebook page URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const brandName = selectedMarket ? getLocalString(selectedMarket.name) : 'Supermarket';
    const jobId = `#JOB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newJob: ScraperHistoryItem = {
      id: jobId,
      source: 'Facebook',
      brand: brandName,
      supermarketId: selectedSupermarket,
      status: 'Running',
      parsedCount: 0,
      startedAt: 'Just now',
    };

    updateHistory((prev) => [newJob, ...prev]);

    try {
      const res = await scraperService.scrapeFacebookPage({
        supermarketId: selectedSupermarket,
        pageUrl,
        daysBack,
        resultsLimit,
      });

      showToast(`Scraper job initiated for ${brandName}. Polling server status...`);

      if (res?.createdOffers && res.createdOffers.length > 0) {
        recordSupermarketScraped(selectedSupermarket);
        updateHistory((prev) =>
          prev.map((item) =>
            item.id === jobId
              ? {
                  ...item,
                  status: 'Completed',
                  parsedCount: res.createdOffers!.length,
                  offers: res.createdOffers,
                }
              : item
          )
        );
        syncExtractedOffersToOffersHub(res.createdOffers);
        setReviewOffers(res.createdOffers);
        showToast(
          `Extraction finished immediately! Extracted ${res.createdOffers.length} offers for ${brandName}.`
        );
      } else {
        let isDone = false;
        let attempts = 0;
        const maxAttempts = 20;

        while (!isDone && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          attempts++;

          try {
            const statusRes = await scraperService.getJobStatus();
            if (statusRes) {
              setJobStatus(statusRes);
              if (statusRes.isRunning === false) {
                isDone = true;
              }
            }
          } catch {
            // silent poll failure
          }
        }

        try {
          const freshOffers = await catalogService.getOffers({ onlyVerified: false });
          const supermarketOffers = freshOffers.filter(
            (o) =>
              o.supermarketId === selectedSupermarket ||
              (o.supermarketName &&
                o.supermarketName.toLowerCase().includes(brandName.toLowerCase())) ||
              (brandName &&
                o.supermarketName &&
                brandName.toLowerCase().includes(o.supermarketName.toLowerCase()))
          );

          const finalOffers = supermarketOffers;

          updateHistory((prev) =>
            prev.map((item) =>
              item.id === jobId
                ? {
                    ...item,
                    status: 'Completed',
                    parsedCount: finalOffers.length,
                    offers: finalOffers,
                  }
                : item
            )
          );

          if (finalOffers.length > 0) {
            syncExtractedOffersToOffersHub(finalOffers);
            setReviewOffers(finalOffers);
            showToast(`Scraper finished for ${brandName}! Fetched ${finalOffers.length} offers.`);
          } else {
            showToast(`Scraper finished for ${brandName}, but no new offers were extracted.`);
          }
        } catch {
          updateHistory((prev) =>
            prev.map((item) => (item.id === jobId ? { ...item, status: 'Completed' } : item))
          );
        }
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncExtractedOffersToOffersHub = (newOffers: Offer[]) => {
    if (!newOffers || newOffers.length === 0) return;
    try {
      const existingRaw = sessionStorage.getItem('homepal_recent_scraped_offers');
      const existing: Offer[] = existingRaw ? JSON.parse(existingRaw) : [];

      const offerKey = (o: Offer) =>
        o.id ||
        `${getLocalString(o.name || o.title)}_${o.discountedPrice || o.price}_${o.supermarketId || o.supermarketName}`;

      const existingKeys = new Set(existing.map(offerKey));
      const stampedNew = newOffers.map((o) => ({
        ...o,
        createdAt: o.createdAt || new Date().toISOString(),
      }));
      const uniqueNew = stampedNew.filter((o) => !existingKeys.has(offerKey(o)));

      const updated = [...uniqueNew, ...existing];
      sessionStorage.setItem('homepal_recent_scraped_offers', JSON.stringify(updated));

      // Update state live so Daily Ingestion Rate immediately increments
      setCatalogOffers((prev) => {
        const prevKeys = new Set(prev.map(offerKey));
        const added = stampedNew.filter((o) => !prevKeys.has(offerKey(o)));
        return [...added, ...prev];
      });
      setTotalCatalogOffersCount((prev) => prev + uniqueNew.length);
    } catch (e) {
      console.error('Failed to sync offers to session storage:', e);
    }
  };

  const handleRunImageUploadScrape = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupermarket || !uploadFile) {
      setErrorMessage('Please select a supermarket and choose a flyer image file.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const brandName = selectedMarket ? getLocalString(selectedMarket.name) : 'Supermarket';

    try {
      const result = await scraperService.scrapeImageFile(
        selectedSupermarket,
        uploadFile,
        ocrText,
        uploadCaption
      );

      const createdOffersList = result?.createdOffers || [];
      const parsedCount = result?.totalExtractedOffers || createdOffersList.length || 0;

      const newJob: ScraperHistoryItem = {
        id: `#JOB-${Math.floor(1000 + Math.random() * 9000)}`,
        source: 'Flyer Upload',
        brand: brandName,
        supermarketId: selectedSupermarket,
        status: 'Completed',
        parsedCount,
        startedAt: 'Just now',
        offers: createdOffersList,
      };

      updateHistory((prev) => [newJob, ...prev]);

      if (createdOffersList.length > 0) {
        syncExtractedOffersToOffersHub(createdOffersList);
        setReviewOffers(createdOffersList);
      }

      showToast(`Flyer processed via Vision AI for ${brandName}! Extracted ${parsedCount} offers.`);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadCaption('');
      setOcrText('');
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunBatchScrape = async () => {
    if (supermarkets.length === 0) {
      showToast('No supermarkets available to scrape.');
      return;
    }

    setIsBatchRunning(true);
    showToast('Starting sequential batch scraper pipeline for active chains...');

    let totalExtractedBatch = 0;
    let skippedCount = 0;

    for (let i = 0; i < supermarkets.length; i++) {
      const market = supermarkets[i];
      const name = getLocalString(market.name);
      setBatchProgress({ current: i + 1, total: supermarkets.length, name });

      // ── 24 Hours Cool-down Check ──
      if (skipRecentlyScraped) {
        const { isCoolingDown, timeAgoText } = check24HourCooldown(market.id);
        if (isCoolingDown) {
          skippedCount++;
          const skippedJob: ScraperHistoryItem = {
            id: `#JOB-SKIPPED-${Math.floor(1000 + Math.random() * 9000)}`,
            source: 'Facebook',
            brand: name,
            supermarketId: market.id,
            status: 'Completed',
            parsedCount: 0,
            startedAt: `Skipped (Scraped ${timeAgoText})`,
          };
          updateHistory((prev) => [skippedJob, ...prev]);
          showToast(`Skipped ${name} — already scraped ${timeAgoText} (< 24h limit)`);
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
      }

      const targetUrl =
        market.websiteUrl || `https://www.facebook.com/${name.toLowerCase().replace(/\s+/g, '')}`;
      const jobId = `#JOB-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Log job start in Audit History
      const runningJob: ScraperHistoryItem = {
        id: jobId,
        source: 'Facebook',
        brand: name,
        supermarketId: market.id,
        status: 'Running',
        parsedCount: 0,
        startedAt: 'Just now',
        offers: [],
      };
      updateHistory((prev) => [runningJob, ...prev]);

      try {
        // 2. Trigger scraper for supermarket `i`
        const res = await scraperService
          .scrapeFacebookPage({
            supermarketId: market.id,
            pageUrl: targetUrl,
            daysBack,
            resultsLimit,
          })
          .catch(() => null);

        // 3. Poll status until isRunning === false for supermarket `i`
        let isDone = false;
        let pollAttempts = 0;
        const maxPollAttempts = 25; // max 75 seconds per chain

        while (!isDone && pollAttempts < maxPollAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          pollAttempts++;

          try {
            const statusRes = await scraperService.getJobStatus();
            if (statusRes) {
              setJobStatus(statusRes);
              if (statusRes.isRunning === false) {
                isDone = true;
              }
            }
          } catch {
            // silent failure on poll
          }
        }

        // Record timestamp for 24h cool-down
        recordSupermarketScraped(market.id);

        // 4. Job completed for supermarket `i`, fetch extracted offers
        const createdOffersList = res?.createdOffers || [];
        let parsedCount = createdOffersList.length;

        if (parsedCount === 0) {
          try {
            const freshOffers = await catalogService.getOffers({ onlyVerified: false });
            const chainOffers = freshOffers.filter(
              (o) =>
                o.supermarketId === market.id ||
                o.supermarketName?.toLowerCase().includes(name.toLowerCase())
            );
            if (chainOffers.length > 0) {
              parsedCount = chainOffers.length;
              syncExtractedOffersToOffersHub(chainOffers);
            }
          } catch {
            // silent
          }
        } else {
          syncExtractedOffersToOffersHub(createdOffersList);
        }

        totalExtractedBatch += parsedCount;

        // 5. Update Audit History entry to Completed
        updateHistory((prev) =>
          prev.map((item) =>
            item.id === jobId
              ? {
                  ...item,
                  status: 'Completed',
                  parsedCount,
                  offers: createdOffersList,
                }
              : item
          )
        );
      } catch (e) {
        console.error(`Batch scrape error for ${name}:`, e);
        updateHistory((prev) =>
          prev.map((item) => (item.id === jobId ? { ...item, status: 'Failed' } : item))
        );
      }

      // Pause before triggering next supermarket chain
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Final Catalog Refresh
    try {
      const freshOffers = await catalogService.getOffers({ onlyVerified: false });
      if (freshOffers.length > 0) {
        syncExtractedOffersToOffersHub(freshOffers);
      }
    } catch (e) {
      console.error('Failed to refresh offers after batch scrape:', e);
    }

    setIsBatchRunning(false);
    setBatchProgress(null);
    showToast(
      `Batch scraping finished! Extracted ${totalExtractedBatch} offers (${skippedCount > 0 ? `${skippedCount} chains skipped < 24h` : 'all processed'}).`
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const totalParsedCount = Math.max(
    totalCatalogOffersCount,
    history.reduce((acc, item) => acc + item.parsedCount, 0)
  );

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-16 px-4 sm:px-0">
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-3 animate-fade-in border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Catalog Pipeline</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Scraping Ingestion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
            Offer Scraping &amp; Ingestion
          </h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Automate flyer extraction, run AI vision scraping jobs, and feed backend catalog offers.
          </p>
        </div>

        {/* Top Header Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap shrink-0">
          <label className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 cursor-pointer select-none transition-colors shrink-0 w-full sm:w-auto">
            <input
              type="checkbox"
              checked={skipRecentlyScraped}
              onChange={(e) => setSkipRecentlyScraped(e.target.checked)}
              className="w-4 h-4 accent-[#1F3D32] rounded cursor-pointer"
            />
            <span>Skip scraped &lt; 24h ago</span>
          </label>

          <Button
            variant="primary"
            onClick={handleRunBatchScrape}
            disabled={isBatchRunning || supermarkets.length === 0}
            className={cn(
              'flex items-center gap-2 shrink-0 w-full sm:w-auto',
              isBatchRunning || supermarkets.length === 0 ? '' : ''
            )}
            isLoading={isBatchRunning}
          >
            {isBatchRunning ? (
              <span>
                Scraping {batchProgress?.current}/{batchProgress?.total} ({batchProgress?.name})
              </span>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.42" />
                </svg>
                <span>Scrape All Chains</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard/supermarkets')}
            className="flex items-center gap-2 shrink-0 w-full sm:w-auto"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-500"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>Manage Supermarkets</span>
          </Button>

          {history.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                const csv = history
                  .map((h) => `${h.id},${h.source},${h.brand},${h.status},${h.parsedCount}`)
                  .join('\n');
                const blob = new Blob([`Job ID,Source,Brand,Status,Parsed Count\n${csv}`], {
                  type: 'text/csv',
                });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'scraping_pipeline_logs.csv';
                link.click();
                showToast('Logs exported successfully');
              }}
              className="flex items-center gap-2 shrink-0 w-full sm:w-auto"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Logs
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 text-xs font-semibold text-red-700 bg-red-50 rounded-xl border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* ── Main Control Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left: Scraper Control Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6 gap-6">
            <button
              onClick={() => setActiveTab('facebook')}
              className={cn(
                'pb-3 text-sm font-bold cursor-pointer transition-colors relative bg-transparent border-none',
                activeTab === 'facebook'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Facebook Auto-Scraper
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                'pb-3 text-sm font-bold cursor-pointer transition-colors relative bg-transparent border-none',
                activeTab === 'upload'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Flyer Manual Upload (Vision AI)
            </button>
          </div>

          {/* Facebook Form */}
          {activeTab === 'facebook' && (
            <form onSubmit={handleRunSingleUrlScrape} className="flex flex-col gap-5">
              {/* Supermarket Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">Select Supermarket Chain</label>
                {supermarkets.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex justify-between items-center">
                    <span>No supermarkets found in database.</span>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/supermarkets')}
                      className="text-xs font-bold text-slate-900 hover:underline border-none bg-transparent cursor-pointer"
                    >
                      Add Supermarket →
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full flex items-center">
                    <select
                      value={selectedSupermarket}
                      onChange={(e) => handleSupermarketChange(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none cursor-pointer box-border focus:border-slate-400"
                      required
                    >
                      {supermarkets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {getLocalString(s.name)}
                        </option>
                      ))}
                    </select>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Selected Supermarket Card Preview */}
              {selectedMarket && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedMarket.logoPath ? (
                      <img
                        src={getImageUrl(selectedMarket.logoPath) || ''}
                        alt="Logo"
                        className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                        {getLocalString(selectedMarket.name).substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {getLocalString(selectedMarket.name)}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {selectedMarket.address || 'Cairo, Egypt'}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-700 shrink-0">
                    {selectedMarket.branches || 10}+ Branches
                  </span>
                </div>
              )}

              {/* Page URL input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">Target Facebook Page URL</label>
                <div className="relative">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <input
                    type="url"
                    value={pageUrl}
                    onChange={(e) => setPageUrl(e.target.value)}
                    placeholder="https://facebook.com/supermarket/offers"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white outline-none box-border focus:border-slate-400 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Scrape Depth & Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Scrape Depth (Days Back)
                  </label>
                  <div className="relative w-full flex items-center">
                    <select
                      value={daysBack}
                      onChange={(e) => setDaysBack(Number(e.target.value))}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none cursor-pointer"
                    >
                      <option value={1}>Last 24 Hours (1 Day)</option>
                      <option value={3}>Last 3 Days</option>
                      <option value={7}>Last 7 Days (1 Week)</option>
                      <option value={14}>Last 14 Days</option>
                      <option value={30}>Last 30 Days (1 Month)</option>
                    </select>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Results Limit</label>
                  <div className="relative w-full flex items-center">
                    <select
                      value={resultsLimit}
                      onChange={(e) => setResultsLimit(Number(e.target.value))}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none cursor-pointer"
                    >
                      <option value={10}>Top 10 Offers</option>
                      <option value={25}>Top 25 Offers</option>
                      <option value={50}>Top 50 Offers</option>
                      <option value={100}>Top 100 Offers</option>
                    </select>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedSupermarket}
                className={cn(
                  'w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-2 mt-2',
                  isSubmitting || !selectedSupermarket
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-slate-800 active:scale-[0.99]'
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Executing Scraper...
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Run Facebook Scraper
                  </>
                )}
              </button>
            </form>
          )}

          {/* Flyer Upload Form */}
          {activeTab === 'upload' && (
            <form onSubmit={handleRunImageUploadScrape} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">Supermarket Chain</label>
                <select
                  value={selectedSupermarket}
                  onChange={(e) => handleSupermarketChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white outline-none cursor-pointer"
                  required
                >
                  {supermarkets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getLocalString(s.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Drag & Drop File Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">
                  Flyer Image File (JPG, PNG, WEBP)
                </label>
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center gap-3 relative hover:border-slate-400 transition-colors">
                  {uploadPreview ? (
                    <div className="relative group w-full max-h-48 flex justify-center">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="max-h-48 rounded-xl object-contain border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg text-xs hover:bg-slate-900 border-none cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 m-0 mb-1">
                          Click to select flyer image
                        </p>
                        <p className="text-[11px] text-slate-400 m-0">
                          Supports single flyer page or catalogue screenshot
                        </p>
                      </div>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Optional Caption & OCR text */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">
                  Flyer Caption / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Weekend Mega Deals Oct 2026"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !uploadFile}
                className={cn(
                  'w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-2 mt-2',
                  isSubmitting || !uploadFile
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-slate-800 active:scale-[0.99]'
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Vision AI...
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Extract Offers via Vision AI
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Live Scraper Status Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
              Scraper Engine Status
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    jobStatus?.isRunning
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-500 animate-pulse'
                  )}
                />
                <span>
                  {jobStatus?.isRunning ? 'Engine Scraping Active' : 'Engine Idle & Ready'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">v2.4-production</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Backend Endpoint:</span>
                <span className="font-mono font-medium text-slate-900 truncate max-w-[150px]">
                  /scrape/facebook-page
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Image Ingestion:</span>
                <span className="font-mono font-medium text-slate-900 truncate max-w-[150px]">
                  /scrape/image-file
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Scraped Offers:</span>
                <span className="font-bold text-slate-900">{totalParsedCount}</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Desk View Metrics & Daily Ingestion Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Desk View</h3>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => navigate('/dashboard/offers')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col cursor-pointer hover:bg-slate-100/80 transition-colors"
                title="Click to view and verify unverified offers in Offers Hub"
              >
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  NEEDS REVIEW
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1">{needsReviewCount}</span>
                <span className="text-[10px] text-amber-700 font-semibold mt-0.5">
                  Unverified Offers
                </span>
              </div>

              <div
                onClick={() => navigate('/dashboard/supermarkets')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col cursor-pointer hover:bg-slate-100/80 transition-colors"
                title="Click to manage supermarket chains"
              >
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  ACTIVE PIPELINES
                </span>
                <span className="text-2xl font-black text-[#1F3D32] mt-1">
                  {activePipelinesCount}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                  Supermarket Chains
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
                  {catalogOffers.length} Total Offers
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

      {/* ── Recent Scraping Jobs Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 m-0">
              Recent Scraping Audit History
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Audit live execution logs and extracted offer results from real backend runs.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 border border-slate-200 rounded-full text-slate-700 shadow-2xs">
            <span className="text-sm font-black leading-none">{history.length}</span>
            <span className="text-[10px] font-bold leading-none mt-0.5">Jobs</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="text-slate-400"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-xs font-bold text-slate-700 m-0">No scraping history logged yet</p>
            <p className="text-[11px] text-slate-400 m-0">
              Run a scraper job above to see live history logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 whitespace-nowrap">Job ID</th>
                  <th className="px-4 py-3 whitespace-nowrap">Supermarket Brand</th>
                  <th className="px-4 py-3 whitespace-nowrap">Source</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Offers Extracted</th>
                  <th className="px-4 py-3 whitespace-nowrap">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                      {h.id}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {h.brand}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {h.source}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {h.offers && h.offers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setReviewOffers(h.offers!)}
                          className="text-xs font-bold text-slate-900 hover:text-emerald-600 hover:underline border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5"
                        >
                          <span>{h.parsedCount} offers</span>
                          <span className="text-[10px] text-slate-400 font-normal">(View)</span>
                        </button>
                      ) : (
                        <span>{h.parsedCount} offers</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {h.startedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Extracted Offers Review Modal ── */}
      {reviewOffers && (
        <Modal
          title={`Extracted Offers (${reviewOffers.length})`}
          onClose={() => setReviewOffers(null)}
          isOpen={true}
        >
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                {reviewOffers.length} offers extracted & synchronized with Offers Hub.
              </span>
              <button
                type="button"
                onClick={() => {
                  syncExtractedOffersToOffersHub(reviewOffers);
                  setReviewOffers(null);
                  navigate('/dashboard/offers');
                }}
                className="px-3.5 py-1.5 bg-[#1F3D32] hover:bg-[#162D25] text-white rounded-lg text-xs font-bold cursor-pointer border-none shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Publish to Offers Hub</span>
                <span>→</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {reviewOffers.map((off, idx) => (
                <ExtractedOfferCard key={off.id || idx} offer={off} />
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
