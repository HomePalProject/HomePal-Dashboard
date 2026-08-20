import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@lib/utils';
import { getErrorMessage } from '@lib/utils';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { analyticsService } from '@services/analyticsService';
import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import type { UserDemographicsData } from '@typeDefs/analyticsTypes';
import { formatCurrencyString } from '@lib/formatters';

function RecenterButton({ center, zoom }: { center: [number, number]; zoom: number }) {
  const { t } = useTranslation('geographicDemographics');
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-left" style={{ top: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            map.flyTo(center, zoom, { animate: true, duration: 1.5 });
          }}
          className="flex! items-center justify-center bg-white hover:bg-gray-100"
          style={{ width: '34px', height: '34px' }}
          title={t('recenterTitle')}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function GeographicDemographicsSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 pb-15 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-xl" />
        </div>
        <div className="flex gap-3 items-center">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Map Skeleton */}
        <div className="bg-surface rounded-2xl border border-border p-6 h-127.5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="w-full h-100 rounded-3xl" />
        </div>

        {/* Right Cards Skeleton */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Budget */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-40 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          </div>

          {/* Card 2: Age Breakdown */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <Skeleton className="h-4 w-40 rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-3xl bg-surface-variant/20 space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
              <div className="p-3 rounded-3xl bg-surface-variant/20 space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>
          </div>

          {/* Card 3: Top Grocery Category */}
          <div className="bg-surface rounded-2xl border border-border p-6 flex-1 relative overflow-hidden min-h-55 flex flex-col">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded-lg" />
              <Skeleton className="h-3.5 w-44 rounded-lg" />
            </div>
            <div className="space-y-3 pt-4 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Chart Skeleton */}
      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="h-20 flex gap-4 items-end pt-4">
          {['h-[60%]', 'h-[80%]', 'h-[100%]', 'h-[40%]', 'h-[70%]'].map((hClass, i) => (
            <Skeleton key={i} className={cn('flex-1 rounded-t-2xl', hClass)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GeographicDemographics() {
  const { t, i18n } = useTranslation('geographicDemographics');
  const getLocalizedSize = (sizeStr: string) => {
    const normalized = sizeStr.toLowerCase().trim();
    if (
      normalized.includes('1-2') ||
      normalized.includes('1 person') ||
      normalized.includes('2 people')
    ) {
      return t('size_members_1_2', 'Members 1-2');
    }
    if (normalized.includes('3-4')) {
      return t('size_members_3_4', 'Members 3-4');
    }
    if (normalized.includes('5') || normalized.includes('5+')) {
      return t('size_members_5', 'Members +5');
    }
    return t(sizeStr, sizeStr);
  };
  const [data, setData] = useState<GeographicDemographicsData | null>(null);
  const [userDemographics, setUserDemographics] = useState<UserDemographicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [result, userDemoRes] = await Promise.all([
        analyticsService.getDemographics(),
        analyticsService.getUserDemographics().catch(() => null),
      ]);
      if (!result) throw new Error('No demographic data found');
      setData(result);
      if (userDemoRes) setUserDemographics(userDemoRes);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
    }
  }, [i18n.language]);

  useEffect(() => {
    fetchData().then(() => setLoading(false));
  }, [fetchData]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 800));
    if (!data) return;
    const headers = ['District', 'Growth', 'HH Density', 'Avg Income', 'Population'];
    const csvContent = [
      headers.join(','),
      ...data.districts.map((d) =>
        [`"${d.name}"`, d.growth, d.hhDensity, `"${d.avgIncome}"`, `"${d.pop}"`].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'demographics_report_egypt.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
    showToast(t('exportSuccess'));
  };

  const handleUpdateData = async () => {
    setIsUpdating(true);
    await fetchData();
    setIsUpdating(false);
    showToast(t('dataRefreshed'));
  };

  const interpolateColor = (intensity: number) => {
    // Light to dark green based on intensity
    if (intensity >= 0.8) return '#166534'; // High
    if (intensity >= 0.6) return '#15803d'; // Med-High
    if (intensity >= 0.4) return '#22c55e'; // Med
    return '#86efac'; // Low
  };

  if (loading) {
    return <GeographicDemographicsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-100 text-slate-500 bg-white rounded-2xl border border-border">
        <p>{error || 'Failed to load demographic data'}</p>
      </div>
    );
  }

  const cairoCenter: [number, number] = [30.02, 31.2];

  return (
    <div className="w-full flex flex-col gap-6 pb-15">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[28px] text-text-primary tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-typography-bodysmall text-text-secondary max-w-2xl">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="gap-2 px-4"
          >
            {isExporting ? (
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.42" />
              </svg>
            ) : (
              t('exportReport')
            )}
          </Button>
          <Button
            onClick={handleUpdateData}
            disabled={isUpdating}
            variant="primary"
            size="sm"
            className="gap-2 px-4"
          >
            {isUpdating ? (
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.42" />
              </svg>
            ) : (
              t('updateData')
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-1 mb-1 text-sm text-status-error bg-status-error-container rounded-3xl border border-status-error/20">
          {error} ({t('fallbackData')})
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="bg-surface rounded-2xl border border-border p-6 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary mb-1">{t('mapTitle')}</h2>
              <p className="text-[13px] text-text-secondary">{t('mapSubtitle')}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {t('liveData')}
            </div>
          </div>

          <div className="relative w-full h-100 sm:h-125 rounded-3xl overflow-hidden border border-border z-0">
            <div className="absolute left-4 bottom-4 bg-surface/90 px-4 py-3 rounded-3xl shadow-md z-1000 backdrop-blur-sm">
              <div className="text-sm font-bold text-text-secondary mb-2 uppercase">
                {t('densityIntensity')}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-text-secondary">{t('low')}</span>
                <div className="w-15 h-2 bg-linear-to-r from-green-300 to-green-800 rounded-3xl" />
                <span className="text-sm text-text-secondary">{t('high')}</span>
              </div>
            </div>

            <MapContainer center={cairoCenter} zoom={11} className="w-full h-full">
              {(() => {
                const highest = [...data.districts].sort((a, b) => b.intensity - a.intensity)[0];
                const targetCenter = highest
                  ? ([highest.lat, highest.lng] as [number, number])
                  : cairoCenter;
                return <RecenterButton center={targetCenter} zoom={13} />;
              })()}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {data.districts.map((district) => (
                <Circle
                  key={district.id}
                  center={[district.lat, district.lng]}
                  radius={district.radius}
                  pathOptions={{
                    fillColor: interpolateColor(district.intensity),
                    fillOpacity: 0.6,
                    color: interpolateColor(district.intensity),
                    weight: 2,
                  }}
                >
                  <Tooltip sticky>
                    <div className="px-2 py-1 min-w-45">
                      <div className="text-base font-bold text-text-primary mb-1 text-center font-sans">
                        {district.name}
                      </div>
                      <div className="text-[13px] font-bold text-primary text-center mb-3 bg-primary-container p-1 rounded-3xl font-sans">
                        {district.growth} {t('newHouseholds')}
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs font-sans">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t('hhDensity')}</span>
                          <span className="font-semibold text-text-primary">
                            {district.hhDensity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t('avgIncome')}</span>
                          <span className="font-semibold text-text-primary">
                            {district.avgIncome}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t('pop')}</span>
                          <span className="font-semibold text-text-primary">{district.pop}</span>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </Circle>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex justify-between items-start mb-1">
              <div className="text-sm font-bold text-text-primary">{t('avgMonthlyBudget')}</div>
              <div className="text-text-secondary">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-primary">
                {formatCurrencyString(data.budget.value, t('currency'))}
              </span>
              <span className="text-[13px] text-text-secondary">{t('perHousehold')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-semibold text-text-secondary">
              <span>{data.budget.region}</span>
              <span className="text-status-success">{data.budget.change}</span>
            </div>
          </div>

          {userDemographics && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="text-sm font-bold text-text-primary mb-3">
                {t('avgUserAgeBreakdown')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-3xl bg-surface-variant/50">
                  <div className="text-xs text-text-secondary">{t('avgHouseholderAge')}</div>
                  <div className="text-xl font-bold text-primary mt-1">
                    {t('years', {
                      count: userDemographics.avgAgeHouseholders || 28,
                    })}
                  </div>
                </div>
                <div className="p-3 rounded-3xl bg-surface-variant/50">
                  <div className="text-xs text-text-secondary">{t('avgOverallUserAge')}</div>
                  <div className="text-xl font-bold text-primary mt-1">
                    {t('years', {
                      count: userDemographics.avgAgeUsers || 26,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-surface rounded-2xl border border-border p-6 flex-1 relative overflow-hidden">
            <h2 className="text-sm font-bold text-text-primary mb-1">{t('topGroceryCategory')}</h2>
            <p className="text-xs text-text-secondary mb-6">{t('topGrocerySubtitle')}</p>

            <div className="flex flex-col gap-6 relative z-10">
              {data.topCategories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[13px] font-semibold text-text-primary mb-2">
                    <span>{cat.name}</span>
                    <span className="text-text-secondary">{cat.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-3xl overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-3xl transition-all duration-500 ease-out"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-5 right-5 opacity-5 pointer-events-none z-0">
              <svg
                className="w-25 h-25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-text-primary">{t('hhSizeDistribution')}</h2>
            <p className="text-xs text-text-disabled mt-2">{t('hhSizeSubtitle')}</p>
          </div>
          <div className="px-3 py-1 rounded-full border border-border text-xs font-semibold text-text-secondary bg-surface-variant/30">
            {t('liveAnalytics')}
          </div>
        </div>

        <div className="flex items-end justify-between h-40 px-3 sm:px-8 gap-3 sm:gap-6 pt-6 pb-2 border-b border-border/50">
          {data.householdSize.map((item, i) => {
            const maxValue = Math.max(...data.householdSize.map((d) => d.value), 1);
            const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), 12);
            const isMax = item.value === maxValue;
            return (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex flex-col items-center flex-1 justify-end">
                  <span
                    className={cn(
                      'text-xs font-bold mb-2 transition-all group-hover:scale-110',
                      isMax ? 'text-primary' : 'text-text-secondary'
                    )}
                  >
                    {item.value}%
                  </span>
                  <div
                    className={cn(
                      'w-full max-w-36 rounded-t-2xl relative transition-all duration-300 group-hover:opacity-90',
                      isMax
                        ? 'bg-primary shadow-sm shadow-primary/20'
                        : 'bg-surface-variant hover:bg-surface-variant/80'
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <div
                  className={cn(
                    'text-xs text-center mt-3 whitespace-nowrap',
                    isMax ? 'font-bold text-primary' : 'font-medium text-text-secondary'
                  )}
                >
                  {getLocalizedSize(item.size)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {toastMessage && (
        <div className="fixed bottom-2 right-2 bg-gray-900 text-white px-6 py-3 rounded-3xl text-[13px] font-medium shadow-lg flex items-center gap-2 z-9999 animate-[slideUp_0.3s_ease-out]">
          <svg
            className="w-4 h-4 text-status-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
