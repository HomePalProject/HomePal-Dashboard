import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '@lib/utils';
import { getLocalString } from '@lib/formatters';
import { fetchBilingual } from '@lib/localization';
import { catalogService } from '@services/catalogService';
import type { Supermarket } from '@typeDefs/catalogTypes';

export function useSupermarkets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [marketModal, setMarketModal] = useState<{ open: boolean; editing?: Supermarket }>({
    open: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setMarketModal({ open: true });
      setSearchParams(
        (prev) => {
          prev.delete('openAdd');
          return prev;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogService.getSupermarkets();
      setSupermarkets(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setSupermarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filtered = supermarkets.filter((s) =>
    getLocalString(s.name).toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveMarket = async (data: any) => {
    try {
      const res: any = await catalogService.saveSupermarket(data, marketModal.editing?.id);
      const targetId = marketModal.editing?.id || res?.data?.data?.id || res?.data?.id || res?.id;

      if (targetId && data.logoFile) {
        await catalogService.uploadSupermarketLogo(targetId, data.logoFile);
      } else if (targetId && data.deleteLogo) {
        await catalogService.deleteSupermarketLogo(targetId).catch(() => null);
      }

      void fetchData();
      return null;
    } catch (error: any) {
      return getErrorMessage(error);
    }
  };

  const handleEditSupermarket = async (s: Supermarket) => {
    setLoadingEditId(s.id);
    try {
      const { en, ar } = await fetchBilingual((lang) =>
        catalogService.getSupermarketById(s.id, lang)
      );
      setMarketModal({
        open: true,
        editing: {
          ...s,
          name: [
            { culture: 'en', value: getLocalString(en.name) },
            { culture: 'ar', value: getLocalString(ar.name) },
          ],
        },
      });
    } catch {
      setMarketModal({ open: true, editing: s });
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await catalogService.deleteSupermarket(deleteTarget.id);
      setDeleteTarget(null);
      void fetchData();
    } catch (error: any) {
      alert(`Delete failed: ${getErrorMessage(error)}`);
    } finally {
      setDeleting(false);
    }
  };

  return {
    supermarkets,
    filtered,
    loading,
    search,
    setSearch,
    viewMode,
    setViewMode,
    marketModal,
    setMarketModal,
    deleteTarget,
    setDeleteTarget,
    deleting,
    loadingEditId,
    handleSaveMarket,
    handleEditSupermarket,
    handleDelete,
  };
}
