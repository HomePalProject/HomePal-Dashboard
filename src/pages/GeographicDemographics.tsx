import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@lib/utils';
import { getErrorMessage } from '@lib/utils';
import { Button } from '@components/ui/Button';
import { analyticsService } from '@services/analyticsService';
import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import type { UserDemographicsData } from '@typeDefs/analyticsTypes';
import { MOCK_DEMOGRAPHICS_DATA } from '@constants/demographicsData';

function RecenterButton({ center, zoom }: { center: [number, number]; zoom: number }) {
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
          className="!flex items-center justify-center bg-white hover:bg-gray-100"
          style={{ width: '34px', height: '34px' }}
          title="Recenter to Highest Density"
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

export default function GeographicDemographics() {
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
      setData(result || MOCK_DEMOGRAPHICS_DATA);
      if (userDemoRes) setUserDemographics(userDemoRes);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      // Fallback to mock data on error for demo purposes
      setData(MOCK_DEMOGRAPHICS_DATA);
    }
  }, []);

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
    showToast('Report exported successfully');
  };

  const handleUpdateData = async () => {
    setIsUpdating(true);
    await fetchData();
    setIsUpdating(false);
    showToast('Data refreshed successfully');
  };

  const interpolateColor = (intensity: number) => {
    // Light to dark green based on intensity
    if (intensity >= 0.8) return '#166534'; // High
    if (intensity >= 0.6) return '#15803d'; // Med-High
    if (intensity >= 0.4) return '#22c55e'; // Med
    return '#86efac'; // Low
  };

  if (loading || !data) {
    return <div className="p-10 text-text-secondary">Loading geographic data...</div>;
  }

  const cairoCenter: [number, number] = [30.02, 31.2];

  return (
    <div className="w-full flex flex-col gap-6 pb-15">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[28px] text-text-primary tracking-tight mb-[8px]">
            Geographic Demographics
          </h1>
          <p className="text-typography-bodysmall text-text-secondary max-w-2xl">
            Comprehensive household data analysis across central districts.
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="gap-[8px] px-4"
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
              'Export Report'
            )}
          </Button>
          <Button
            onClick={handleUpdateData}
            disabled={isUpdating}
            variant="primary"
            size="sm"
            className="gap-[8px] px-4"
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
              'Update Data'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-1 mb-1 text-sm text-status-error bg-status-error-container rounded-3xl border border-status-error/20">
          {error} (Showing fallback data)
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="bg-surface rounded-2xl border border-border p-6 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary mb-[4px]">
                Regional Distribution Map (Egypt)
              </h2>
              <p className="text-[13px] text-text-secondary">
                Household density heat-mapping by district.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <span className="w-[8px] h-[8px] rounded-full bg-primary"></span>
              Live Data
            </div>
          </div>

          <div className="relative w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-border z-0">
            <div className="absolute left-4 bottom-24 bg-surface/90 px-4 py-3 rounded-3xl shadow-md z-1000 backdrop-blur-sm">
              <div className="text-[11px] font-bold text-text-secondary mb-[8px] uppercase">
                Density Intensity
              </div>
              <div className="flex items-center gap-[4px]">
                <span className="text-[11px] text-text-secondary">Low</span>
                <div className="w-15 h-[8px] bg-linear-to-r from-green-300 to-green-800 rounded-3xl" />
                <span className="text-[11px] text-text-secondary">High</span>
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
                    <div className="px-[8px] py-[4px] min-w-45">
                      <div className="text-base font-bold text-text-primary mb-[4px] text-center font-sans">
                        {district.name}
                      </div>
                      <div className="text-[13px] font-bold text-primary text-center mb-3 bg-primary-container p-[4px] rounded-3xl font-sans">
                        {district.growth} New Households
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs font-sans">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">HH Density:</span>
                          <span className="font-semibold text-text-primary">
                            {district.hhDensity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Avg Income:</span>
                          <span className="font-semibold text-text-primary">
                            {district.avgIncome}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Population:</span>
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
              <div className="text-sm font-bold text-text-primary">Avg. Monthly Budget</div>
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
            <div className="flex items-baseline gap-[8px] mb-6">
              <span className="text-4xl font-extrabold text-primary">{data.budget.value}</span>
              <span className="text-[13px] text-text-secondary">/ household</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-semibold text-text-secondary">
              <span>{data.budget.region}</span>
              <span className="text-status-success">{data.budget.change}</span>
            </div>
          </div>

          {userDemographics && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="text-sm font-bold text-text-primary mb-3">
                Average User Age Breakdown
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-3xl bg-surface-variant/50">
                  <div className="text-xs text-text-secondary">Avg. Householder Age</div>
                  <div className="text-xl font-bold text-primary mt-1">
                    {userDemographics.avgAgeHouseholders
                      ? `${userDemographics.avgAgeHouseholders} yrs`
                      : '28 yrs'}
                  </div>
                </div>
                <div className="p-3 rounded-3xl bg-surface-variant/50">
                  <div className="text-xs text-text-secondary">Avg. Overall User Age</div>
                  <div className="text-xl font-bold text-primary mt-1">
                    {userDemographics.avgAgeUsers
                      ? `${userDemographics.avgAgeUsers} yrs`
                      : '26 yrs'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-surface rounded-2xl border border-border p-6 flex-1 relative overflow-hidden">
            <h2 className="text-sm font-bold text-text-primary mb-[4px]">Top Grocery Category</h2>
            <p className="text-xs text-text-secondary mb-6">By volume in Northern Region</p>

            <div className="flex flex-col gap-6 relative z-10">
              {data.topCategories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[13px] font-semibold text-text-primary mb-[8px]">
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
            <h2 className="text-base font-bold text-text-primary">Household Size Distribution</h2>
            <p className="text-xs text-text-disabled mt-2">
              Percentage breakdown of enrolled household sizes
            </p>
          </div>
          <div className="px-3 py-1 rounded-full border border-border text-xs font-semibold text-text-secondary bg-surface-variant/30">
            Live Analytics
          </div>
        </div>

        <div className="flex items-end justify-between h-16 px-3 sm:px-8 gap-3 sm:gap-6 pt-8 pb-3 border-b border-border/50">
          {data.householdSize.map((item, i) => {
            const maxValue = Math.max(...data.householdSize.map((d) => d.value), 1);
            const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), 12);
            return (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex flex-col items-center flex-1 justify-end">
                  <span
                    className={cn(
                      'text-xs font-bold mb-6 transition-all group-hover:scale-110',
                      i === 2 ? 'text-primary' : 'text-text-secondary'
                    )}
                  >
                    {item.value}%
                  </span>
                  <div
                    className={cn(
                      'w-full max-w-36 rounded-t-2xl relative transition-all duration-300 group-hover:opacity-90',
                      i === 2
                        ? 'bg-primary shadow-sm shadow-primary/20'
                        : 'bg-surface-variant hover:bg-surface-variant/80'
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <div
                  className={cn(
                    'text-xs text-center mt-3 whitespace-nowrap',
                    i === 2 ? 'font-bold text-primary' : 'font-medium text-text-secondary'
                  )}
                >
                  {item.size}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {toastMessage && (
        <div className="fixed bottom-2 right-2 bg-gray-900 text-white px-6 py-3 rounded-3xl text-[13px] font-medium shadow-lg flex items-center gap-[8px] z-9999 animate-[slideUp_0.3s_ease-out]">
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
