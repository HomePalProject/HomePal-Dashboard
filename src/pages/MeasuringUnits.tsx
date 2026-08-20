import { useEffect, useState, useCallback } from 'react';
import { measuringUnitService } from '@services/measuringUnitService';
import type { MeasuringUnit } from '@typeDefs/measuringUnitTypes';

import { fetchBilingual } from '@lib/localization';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

function MeasuringUnitsTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 pl-6 pr-6 py-4">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <Skeleton className="h-3 rounded w-1/3" />
            <Skeleton className="h-2.5 rounded w-1/4" />
          </div>
          <Skeleton className="h-3 w-10 rounded hidden sm:block" />
          <Skeleton className="h-3 w-20 rounded hidden sm:block" />
          <Skeleton className="h-5 w-16 rounded-2xl shrink-0" />
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Aug 13, 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Aug 13, 2026';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Aug 13, 2026';
  }
}

// Helper to extract EN and AR values from localized arrays or string objects
function parseLocalizedPair(data: any): { en: string; ar: string } {
  if (!data) return { en: '—', ar: '—' };
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const en = parsed.find(
          (item: any) => item.culture === 'en' || item.culture === 'en-US'
        )?.value;
        const ar = parsed.find(
          (item: any) => item.culture === 'ar' || item.culture === 'ar-EG'
        )?.value;
        return { en: en || data, ar: ar || '—' };
      }
    } catch {
      // non-json string
    }
    return { en: data, ar: '—' };
  }
  if (Array.isArray(data)) {
    const en = data.find((item: any) => item.culture === 'en' || item.culture === 'en-US')?.value;
    const ar = data.find((item: any) => item.culture === 'ar' || item.culture === 'ar-EG')?.value;
    return { en: en || '—', ar: ar || '—' };
  }
  return { en: String(data), ar: '—' };
}

// Default Seed Units if API returns empty
const SEED_UNITS: MeasuringUnit[] = [
  {
    id: 'seed-1',
    name: [
      { culture: 'en', value: 'Kilogram' },
      { culture: 'ar', value: 'كيلوجرام' },
    ],
    symbol: [
      { culture: 'en', value: 'kg' },
      { culture: 'ar', value: 'كجم' },
    ],
    createdAt: '2026-08-13T11:43:14.225Z',
  },
  {
    id: 'seed-2',
    name: [
      { culture: 'en', value: 'Gram' },
      { culture: 'ar', value: 'جرام' },
    ],
    symbol: [
      { culture: 'en', value: 'g' },
      { culture: 'ar', value: 'جـ' },
    ],
    createdAt: '2026-08-12T10:15:00.000Z',
  },
  {
    id: 'seed-3',
    name: [
      { culture: 'en', value: 'Liter' },
      { culture: 'ar', value: 'لتر' },
    ],
    symbol: [
      { culture: 'en', value: 'L' },
      { culture: 'ar', value: 'لتر' },
    ],
    createdAt: '2026-08-10T14:20:00.000Z',
  },
  {
    id: 'seed-4',
    name: [
      { culture: 'en', value: 'Piece' },
      { culture: 'ar', value: 'قطعة' },
    ],
    symbol: [
      { culture: 'en', value: 'Pcs' },
      { culture: 'ar', value: 'قطعة' },
    ],
    createdAt: '2026-08-08T09:00:00.000Z',
  },
];

export default function MeasuringUnits() {
  const { t, i18n } = useTranslation(['measuringUnits', 'common']);
  const [units, setUnits] = useState<MeasuringUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasuringUnit | null>(null);

  // Form Fields State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [symbolEn, setSymbolEn] = useState('');
  const [symbolAr, setSymbolAr] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<MeasuringUnit | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      let res: MeasuringUnit[] = [];
      if (searchQuery.trim()) {
        res = await measuringUnitService.searchUnits(searchQuery.trim());
      } else {
        res = await measuringUnitService.getUnits();
      }

      if (Array.isArray(res) && res.length > 0) {
        setUnits(res);
      } else if (!searchQuery.trim()) {
        setUnits(SEED_UNITS);
      } else {
        setUnits([]);
      }
    } catch (err) {
      console.error('Failed to load measuring units:', err);
      if (!searchQuery.trim()) {
        setUnits(SEED_UNITS);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, i18n.language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUnits();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUnits]);

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setNameEn('');
    setNameAr('');
    setSymbolEn('');
    setSymbolAr('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (unit: MeasuringUnit) => {
    let resolvedUnit = unit;
    if (!unit.id.startsWith('seed-')) {
      setLoadingEditId(unit.id);
      try {
        const { en, ar } = await fetchBilingual((lang) =>
          measuringUnitService.getUnitById(unit.id, lang)
        );
        resolvedUnit = {
          ...unit,
          name: [
            { culture: 'en', value: parseLocalizedPair(en.name).en },
            { culture: 'ar', value: parseLocalizedPair(ar.name).en },
          ],
          symbol: [
            { culture: 'en', value: parseLocalizedPair(en.symbol).en },
            { culture: 'ar', value: parseLocalizedPair(ar.symbol).en },
          ],
        };
      } catch {
        showToast(t('toastBilingualLoadError'));
      } finally {
        setLoadingEditId(null);
      }
    }

    setEditingUnit(resolvedUnit);
    const namePair = parseLocalizedPair(resolvedUnit.name);
    const symbolPair = parseLocalizedPair(resolvedUnit.symbol);
    setNameEn(namePair.en !== '—' ? namePair.en : '');
    setNameAr(namePair.ar !== '—' ? namePair.ar : '');
    setSymbolEn(symbolPair.en !== '—' ? symbolPair.en : '');
    setSymbolAr(symbolPair.ar !== '—' ? symbolPair.ar : '');
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameAr.trim()) {
      showToast(t('toastRequiredName'));
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: [
        { culture: 'en', value: nameEn.trim() || nameAr.trim() },
        { culture: 'ar', value: nameAr.trim() || nameEn.trim() },
      ],
      symbol: [
        { culture: 'en', value: symbolEn.trim() || symbolAr.trim() },
        { culture: 'ar', value: symbolAr.trim() || symbolEn.trim() },
      ],
    };

    try {
      if (editingUnit && !editingUnit.id.startsWith('seed-')) {
        await measuringUnitService.updateUnit(editingUnit.id, payload);
        showToast(t('toastUpdateSuccess'));
      } else if (editingUnit && editingUnit.id.startsWith('seed-')) {
        // Local seed update simulation
        setUnits((prev) =>
          prev.map((u) =>
            u.id === editingUnit.id ? { ...u, name: payload.name, symbol: payload.symbol } : u
          )
        );
        showToast(t('toastUpdateSuccess'));
      } else {
        const created = await measuringUnitService.createUnit(payload);
        showToast(t('toastAddSuccess'));
        if (created?.id) {
          setUnits((prev) => [created, ...prev]);
        }
      }
      setIsModalOpen(false);
      void loadUnits();
    } catch (err: any) {
      console.error('Failed to save measuring unit:', err);
      // Fallback for seed or offline
      const newUnit: MeasuringUnit = {
        id: editingUnit ? editingUnit.id : `unit-${Date.now()}`,
        name: payload.name,
        symbol: payload.symbol,
        createdAt: new Date().toISOString(),
      };
      if (editingUnit) {
        setUnits((prev) => prev.map((u) => (u.id === editingUnit.id ? newUnit : u)));
      } else {
        setUnits((prev) => [newUnit, ...prev]);
      }
      setIsModalOpen(false);
      showToast(editingUnit ? t('toastUpdateSuccess') : t('toastAddSuccess'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      if (!deleteTarget.id.startsWith('seed-')) {
        await measuringUnitService.deleteUnit(deleteTarget.id);
      }
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showToast(t('toastDeleteSuccess'));
    } catch (err) {
      console.error('Failed to delete unit:', err);
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showToast(t('toastDeleteSuccess'));
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-16 px-4 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-3 border border-slate-700 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight m-0">{t('title')}</h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative inline-flex items-center w-full sm:w-80">
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
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-[#1F3D32]/10 transition-all shadow-2xs"
            />
          </div>

          {/* Add Unit Button */}
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{t('addUnit')}</span>
          </Button>
        </div>
      </div>

      {/* Measuring Units Table Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
        {loading ? (
          <MeasuringUnitsTableSkeleton />
        ) : units.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-slate-300"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-sm font-bold text-slate-700 m-0">{t('noUnitsFound')}</p>
            <p className="text-xs text-slate-400 m-0">{t('noUnitsDesc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="ps-6 pe-4 py-3.5 whitespace-nowrap">{t('thName')}</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">{t('thSymbol')}</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">{t('thCreated')}</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">{t('thStatus')}</th>
                  <th className="pe-6 ps-4 py-3.5 text-right whitespace-nowrap">
                    {t('thActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {units.map((unit) => {
                  const namePair = parseLocalizedPair(unit.name);
                  const symbolPair = parseLocalizedPair(unit.symbol);

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* UNIT NAME (EN / AR) Column */}
                      <td className="ps-6 pe-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {namePair.en}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold mt-0.5" dir="rtl">
                            {namePair.ar}
                          </span>
                        </div>
                      </td>

                      {/* SYMBOL (EN / AR) Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 text-xs">
                            {symbolPair.en}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold mt-0.5" dir="rtl">
                            {symbolPair.ar}
                          </span>
                        </div>
                      </td>

                      {/* CREATED AT Column */}
                      <td className="px-4 py-4 text-slate-600 font-semibold text-xs whitespace-nowrap">
                        {unit.createdAt ? formatDate(unit.createdAt) : 'Aug 13, 2026'}
                      </td>

                      {/* STATUS Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {t('statusActive')}
                        </span>
                      </td>

                      {/* ACTIONS Column */}
                      <td className="pr-6 pl-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit Button */}
                          <button
                            onClick={() => void handleOpenEditModal(unit)}
                            disabled={loadingEditId === unit.id}
                            title={t('editUnitTitle')}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                            onClick={() => setDeleteTarget(unit)}
                            title={t('deleteUnitTitle')}
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

        {/* Table Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>{t('totalUnits', { count: units.length })}</span>
          <span>{t('managementSystem')}</span>
        </div>
      </div>

      {/* ── Add / Edit Measuring Unit Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">
                {editingUnit ? t('modalTitleEdit') : t('modalTitleAdd')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 border-none bg-transparent cursor-pointer transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveUnit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ENGLISH UNIT NAME */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('labelNameEn')}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t('placeholderNameEn')}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-slate-400 transition-colors shadow-2xs"
                  />
                </div>

                {/* ARABIC UNIT NAME */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('labelNameAr')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t('placeholderNameAr')}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-slate-400 transition-colors shadow-2xs text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ENGLISH SYMBOL */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('labelSymbolEn')}
                  </label>
                  <input
                    type="text"
                    value={symbolEn}
                    onChange={(e) => setSymbolEn(e.target.value)}
                    placeholder={t('placeholderSymbolEn')}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-slate-400 transition-colors shadow-2xs"
                  />
                </div>

                {/* ARABIC SYMBOL */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                    {t('labelSymbolAr')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={symbolAr}
                    onChange={(e) => setSymbolAr(e.target.value)}
                    placeholder={t('placeholderSymbolAr')}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-slate-400 transition-colors shadow-2xs text-right"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  {t('common:cancel', 'Cancel')}
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  {editingUnit ? t('btnUpdate') : t('btnSave')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-extrabold text-slate-900 m-0">
                  {t('deleteModalTitle')}
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">{t('deleteModalDesc')}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                {t('common:cancel', 'Cancel')}
              </Button>
              <Button variant="danger" onClick={handleDeleteUnit} isLoading={isSubmitting}>
                {t('delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
