import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@lib/utils';
import { getErrorMessage } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import { MOCK_DEMOGRAPHICS_DATA } from '@constants/demographicsData';

export default function GeographicDemographics() {
  const [data, setData] = useState<GeographicDemographicsData | null>(null);
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
      const result = await analyticsService.getDemographics();
      setData(result || MOCK_DEMOGRAPHICS_DATA);
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
    return <div className="p-40 text-text-secondary">Loading geographic data...</div>;
  }

  const cairoCenter: [number, number] = [30.02, 31.2];

  return (
    <div className="w-full flex flex-col gap-24 pb-15">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-16">
        <div>
          <h1 className="text-22 sm:text-[28px] text-text-primary tracking-tight mb-[8px]">
            Geographic Demographics
          </h1>
          <p className="text-typography-bodysmall text-text-secondary max-w-2xl">
            Comprehensive household data analysis across central districts.
          </p>
        </div>
        <div className="flex gap-12 items-center flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-[8px] px-16 py-2.5 bg-surface border border-border rounded-lg text-13 font-semibold text-text-primary cursor-pointer transition-all duration-200 hover:bg-surface-variant shrink-0 shadow-sm',
              isExporting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <svg
                className="animate-spin w-16 h-16"
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
          </button>
          <button
            onClick={handleUpdateData}
            disabled={isUpdating}
            className={cn(
              'flex items-center gap-[8px] px-16 py-2.5 bg-primary border-none rounded-lg text-13 font-semibold text-white cursor-pointer transition-all duration-200 hover:opacity-90 shrink-0 shadow-sm',
              isUpdating && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isUpdating ? (
              <svg
                className="animate-spin w-16 h-16"
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
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-status-error bg-status-error-container rounded-sm border border-status-error/20">
          {error} (Showing fallback data)
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-24 items-start">
        <div className="bg-surface rounded-md border border-border p-24 relative">
          <div className="flex justify-between items-start mb-24">
            <div>
              <h2 className="text-base font-bold text-text-primary mb-[4px]">
                Regional Distribution Map (Egypt)
              </h2>
              <p className="text-13 text-text-secondary">
                Household density heat-mapping by district.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <span className="w-[8px] h-[8px] rounded-full bg-primary"></span>
              Live Data
            </div>
          </div>

          <div className="relative w-full h-72 sm:h-112.5 rounded-sm overflow-hidden border border-border z-0">
            <div className="absolute left-4 bottom-24 bg-surface/90 px-4 py-12 rounded-sm shadow-md z-1000 backdrop-blur-sm">
              <div className="text-[11px] font-bold text-text-secondary mb-[8px] uppercase">
                Density Intensity
              </div>
              <div className="flex items-center gap-[4px]">
                <span className="text-[11px] text-text-secondary">Low</span>
                <div className="w-15 h-[8px] bg-linear-to-r from-green-300 to-green-800 rounded-sm" />
                <span className="text-[11px] text-text-secondary">High</span>
              </div>
            </div>

            <MapContainer center={cairoCenter} zoom={11} className="w-full h-full">
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
                      <div className="text-13 font-bold text-primary text-center mb-12 bg-primary-container p-[4px] rounded-sm font-sans">
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

        <div className="flex flex-col gap-24">
          <div className="bg-surface rounded-md border border-border p-24">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-bold text-text-primary">Avg. Monthly Budget</div>
              <div className="text-text-secondary">
                <svg
                  className="w-20 h-20"
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
            <div className="flex items-baseline gap-[8px] mb-24">
              <span className="text-4xl font-extrabold text-primary">{data.budget.value}</span>
              <span className="text-13 text-text-secondary">/ household</span>
            </div>
            <div className="flex justify-between items-center text-13 font-semibold text-text-secondary">
              <span>{data.budget.region}</span>
              <span className="text-status-success">{data.budget.change}</span>
            </div>
          </div>

          <div className="bg-surface rounded-md border border-border p-24 flex-1 relative overflow-hidden">
            <h2 className="text-sm font-bold text-text-primary mb-[4px]">Top Grocery Category</h2>
            <p className="text-xs text-text-secondary mb-24">By volume in Northern Region</p>

            <div className="flex flex-col gap-24 relative z-10">
              {data.topCategories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-13 font-semibold text-text-primary mb-[8px]">
                    <span>{cat.name}</span>
                    <span className="text-text-secondary">{cat.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-sm transition-all duration-500 ease-out"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-20 right-20 opacity-5 pointer-events-none z-0">
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

      <div className="bg-surface rounded-md border border-border p-8">
        <div className="flex justify-between items-center mb-40">
          <h2 className="text-base font-bold text-text-primary">Household Size Distribution</h2>
          <div className="px-12 py-1.5 rounded-full border border-border text-xs font-semibold text-text-secondary">
            2026 Data
          </div>
        </div>

        <div className="flex items-end justify-between h-50 px-[8px] sm:px-40 gap-[8px] sm:gap-20">
          {data.householdSize.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4">
              <div
                className={cn(
                  'w-full max-w-20 rounded-t-sm relative transition-all duration-300',
                  i === 2 ? 'bg-primary' : 'bg-surface-variant'
                )}
                style={{ height: `${item.value * 2.5}px` }}
              >
                <div
                  className={cn(
                    'absolute -top-24 left-1/2 -translate-x-1/2 text-xs font-bold',
                    i === 2 ? 'text-primary' : 'text-text-secondary'
                  )}
                >
                  {item.value}%
                </div>
              </div>
              <div
                className={cn(
                  'text-13 text-center',
                  i === 2 ? 'font-bold text-primary' : 'font-medium text-text-secondary'
                )}
              >
                {item.size}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-24 py-12 rounded-sm text-13 font-medium shadow-lg flex items-center gap-[8px] z-9999 animate-[slideUp_0.3s_ease-out]">
          <svg
            className="w-16 h-16 text-status-success"
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
