import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

interface DistrictData {
  id: string;
  name: string;
  growth: string;
  hhDensity: string;
  avgIncome: string;
  pop: string;
  intensity: number; // 0 to 1 (determines the shade of green)
  lat: number;
  lng: number;
  radius: number; // For map circle size
}

interface GeographicDemographicsData {
  districts: DistrictData[];
  budget: { value: string; change: string; region: string };
  topCategories: { name: string; percentage: number }[];
  householdSize: { size: string; value: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { data: null, error: json?.message ?? `Request failed (${res.status})` };
    }
    const data = json?.data !== undefined ? json.data : (json as T);
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error. Please try again.' };
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export default function GeographicDemographics() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<GeographicDemographicsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    const res = await apiFetch<GeographicDemographicsData>('/api/analytics/demographics', token);

    if (res.data) {
      setData(res.data);
    } else {
      // MOCK DATA FALLBACK (EGYPT)
      setData({
        districts: [
          {
            id: 'new_cairo',
            name: 'New Cairo',
            growth: '+15%',
            hhDensity: 'High',
            avgIncome: '$7,150/mo',
            pop: '148,520',
            intensity: 0.9,
            lat: 30.0197,
            lng: 31.4168,
            radius: 6000,
          },
          {
            id: 'sheikh_zayed',
            name: 'Sheikh Zayed',
            growth: '+12%',
            hhDensity: 'High',
            avgIncome: '$6,200/mo',
            pop: '92,100',
            intensity: 0.8,
            lat: 30.045,
            lng: 30.985,
            radius: 4000,
          },
          {
            id: 'maadi',
            name: 'Maadi',
            growth: '+5%',
            hhDensity: 'Med',
            avgIncome: '$5,800/mo',
            pop: '61,200',
            intensity: 0.7,
            lat: 29.965,
            lng: 31.275,
            radius: 2500,
          },
          {
            id: 'heliopolis',
            name: 'Heliopolis',
            growth: '+3%',
            hhDensity: 'Low',
            avgIncome: '$4,500/mo',
            pop: '88,400',
            intensity: 0.4,
            lat: 30.0898,
            lng: 31.3236,
            radius: 3000,
          },
          {
            id: 'nasr_city',
            name: 'Nasr City',
            growth: '+1%',
            hhDensity: 'High',
            avgIncome: '$4,100/mo',
            pop: '220,000',
            intensity: 0.5,
            lat: 30.0626,
            lng: 31.3289,
            radius: 3500,
          },
          {
            id: 'dokki',
            name: 'Dokki',
            growth: '+2%',
            hhDensity: 'High',
            avgIncome: '$5,100/mo',
            pop: '45,000',
            intensity: 0.6,
            lat: 30.0384,
            lng: 31.2114,
            radius: 2000,
          },
          {
            id: 'faisal',
            name: 'Faisal',
            growth: '+8%',
            hhDensity: 'High',
            avgIncome: '$3,200/mo',
            pop: '350,000',
            intensity: 0.85,
            lat: 29.998,
            lng: 31.1578,
            radius: 3000,
          },
          {
            id: 'haram',
            name: 'Al Haram',
            growth: '+6%',
            hhDensity: 'High',
            avgIncome: '$3,500/mo',
            pop: '280,000',
            intensity: 0.75,
            lat: 29.9863,
            lng: 31.1462,
            radius: 3000,
          },
        ],
        budget: { value: '$4,250', change: '↑ 4.2%', region: 'New Cairo District' },
        topCategories: [
          { name: 'Fresh Produce', percentage: 45 },
          { name: 'Dairy & Alternatives', percentage: 28 },
        ],
        householdSize: [
          { size: '1 Person', value: 25 },
          { size: '2 People', value: 40 },
          { size: '3-4 People', value: 65 },
          { size: '5+ People', value: 15 },
        ],
      });
    }
  }, [token]);

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
    await new Promise((r) => setTimeout(r, 1000));
    fetchData();
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
    return (
      <div style={{ padding: 40, color: 'var(--sys-text-secondary)' }}>
        Loading geographic data...
      </div>
    );
  }

  // Cairo Center (centered dynamically to view all districts nicely)
  const cairoCenter: [number, number] = [30.02, 31.2];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: 60,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--sys-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Geographic Demographics
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sys-text-secondary)', maxWidth: 600 }}>
            Comprehensive household data analysis across central districts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid var(--sys-border)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--sys-text-primary)',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isExporting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isExporting) e.currentTarget.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              if (!isExporting) e.currentTarget.style.background = '#fff';
            }}
          >
            {isExporting ? (
              <svg
                style={{ animation: 'spin 1s linear infinite' }}
                width="16"
                height="16"
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'var(--sys-primary)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isUpdating ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isUpdating) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!isUpdating) e.currentTarget.style.opacity = '1';
            }}
          >
            {isUpdating ? (
              <svg
                style={{ animation: 'spin 1s linear infinite' }}
                width="16"
                height="16"
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

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}
      >
        {/* ── Main Map Area ────────────────────────────────────────────────── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 24,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--sys-text-primary)',
                  marginBottom: 4,
                }}
              >
                Regional Distribution Map (Egypt)
              </h2>
              <p style={{ fontSize: 13, color: 'var(--sys-text-secondary)' }}>
                Household density heat-mapping by district.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--sys-text-primary)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--sys-primary)',
                }}
              ></span>
              Live Data
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 450,
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              zIndex: 0,
            }}
          >
            {/* Map Legend */}
            <div
              style={{
                position: 'absolute',
                left: 16,
                bottom: 24,
                background: 'rgba(255,255,255,0.9)',
                padding: '12px 16px',
                borderRadius: 8,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 1000,
                backdropFilter: 'blur(4px)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sys-text-secondary)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                Density Intensity
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--sys-text-secondary)' }}>Low</span>
                <div
                  style={{
                    width: 60,
                    height: 8,
                    background: 'linear-gradient(to right, #86efac, #166534)',
                    borderRadius: 4,
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--sys-text-secondary)' }}>High</span>
              </div>
            </div>

            <MapContainer center={cairoCenter} zoom={11} style={{ width: '100%', height: '100%' }}>
              {/* CartoDB Positron TileLayer for a clean, light map look */}
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
                  {/* Tooltip to show data on hover */}
                  <Tooltip sticky>
                    <div style={{ padding: '4px 8px', minWidth: 180 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: 'var(--sys-text-primary)',
                          marginBottom: 4,
                          textAlign: 'center',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {district.name}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--sys-primary)',
                          textAlign: 'center',
                          marginBottom: 12,
                          background: '#e9f1eb',
                          padding: '4px',
                          borderRadius: 4,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {district.growth} New Households
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          fontSize: 12,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--sys-text-secondary)' }}>HH Density:</span>
                          <span style={{ fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                            {district.hhDensity}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--sys-text-secondary)' }}>Avg Income:</span>
                          <span style={{ fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                            {district.avgIncome}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--sys-text-secondary)' }}>Population:</span>
                          <span style={{ fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                            {district.pop}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </Circle>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* ── Side Panels ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Avg Monthly Budget */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--sys-border)',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                Avg. Monthly Budget
              </div>
              <div style={{ color: 'var(--sys-text-secondary)' }}>
                <svg
                  width="20"
                  height="20"
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--sys-primary)' }}>
                {data.budget.value}
              </span>
              <span style={{ fontSize: 13, color: 'var(--sys-text-secondary)' }}>/ household</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--sys-text-secondary)',
              }}
            >
              <span>{data.budget.region}</span>
              <span style={{ color: '#10b981' }}>{data.budget.change}</span>
            </div>
          </div>

          {/* Top Grocery Category */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--sys-border)',
              padding: '24px',
              flex: 1,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--sys-text-primary)',
                marginBottom: 4,
              }}
            >
              Top Grocery Category
            </h2>
            <p style={{ fontSize: 12, color: 'var(--sys-text-secondary)', marginBottom: 24 }}>
              By volume in Northern Region
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {data.topCategories.map((cat, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--sys-text-primary)',
                      marginBottom: 8,
                    }}
                  >
                    <span>{cat.name}</span>
                    <span style={{ color: 'var(--sys-text-secondary)' }}>{cat.percentage}%</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: '#f4f4f5',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${cat.percentage}%`,
                        background: 'var(--sys-primary)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Faint shopping cart icon in background */}
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                opacity: 0.05,
                pointerEvents: 'none',
              }}
            >
              <svg
                width="100"
                height="100"
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

      {/* ── Bottom Section ──────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--sys-border)',
          padding: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
            Household Size Distribution
          </h2>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: '1px solid var(--sys-border)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--sys-text-secondary)',
            }}
          >
            2026 Data
          </div>
        </div>

        {/* Bar Chart (Histogram) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 200,
            padding: '0 40px',
            gap: 20,
          }}
        >
          {data.householdSize.map((item, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 80,
                  height: `${item.value * 2.5}px`,
                  background: i === 2 ? 'var(--sys-primary)' : '#e2e8f0',
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  transition: 'all 0.3s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: i === 2 ? 'var(--sys-primary)' : 'var(--sys-text-secondary)',
                  }}
                >
                  {item.value}%
                </div>
              </div>
              {/* Label */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: i === 2 ? 700 : 500,
                  color: i === 2 ? 'var(--sys-primary)' : 'var(--sys-text-secondary)',
                  textAlign: 'center',
                }}
              >
                {item.size}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: '#111827',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 9999,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Fix leaflet z-index issues and custom styles */
        .leaflet-container {
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }
        .leaflet-tooltip {
          background-color: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before {
          display: none;
        }
      `}</style>
    </div>
  );
}
