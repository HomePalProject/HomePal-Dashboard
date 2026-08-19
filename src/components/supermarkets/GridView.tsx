import { getLocalString, getLocalizedCulture } from '@lib/formatters';
import { BRANCH_COUNTS } from '@constants/supermarketData';
import type { Supermarket } from '@typeDefs/catalogTypes';
import { SupermarketLogo } from './SupermarketLogo';
import { Button } from '@components/ui/Button';
import { useTranslation } from 'react-i18next';

interface GridViewProps {
  supermarkets: Supermarket[];
  loadingEditId: string | null;
  onEdit: (s: Supermarket) => void;
  onDelete: (target: { id: string; name: string }) => void;
  onAdd: () => void;
}

export function GridView({ supermarkets, loadingEditId, onEdit, onDelete, onAdd }: GridViewProps) {
  const { t, i18n } = useTranslation('supermarkets');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      {supermarkets.map((s) => {
        const name =
          getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') ||
          getLocalString(s.name);
        const branches = s.branches ?? BRANCH_COUNTS[name] ?? 0;
        const fbUrl = s.websiteUrl || 'facebook.com/supermarket/offers';

        return (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-border p-5 flex flex-col justify-between gap-1 shadow-xs hover:border-[#D5CEBF] hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <SupermarketLogo
                  logoPath={s.logoPath}
                  name={name}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full"
                />
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-text-primary m-0 truncate leading-snug">
                    {name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{s.address || 'Cairo, Egypt'}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-surface-variant border border-border rounded-2xl text-[11px] font-bold text-text-primary shrink-0">
                {t('branches', { count: branches })}
              </span>
            </div>

            <div className="w-full h-px bg-[#EAE5D9]" />

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('endpointLabel')}
              </span>
              <div className="bg-surface border border-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-400 shrink-0"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="text-xs font-mono text-slate-700 truncate">
                    {fbUrl.replace(/^https?:\/\//, '')}
                  </span>
                </div>

                <a
                  href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#1A2E26] shrink-0"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={() => onEdit(s)}
                disabled={loadingEditId === s.id}
                variant="outline"
                size="md"
                className="flex-1 gap-1.5"
              >
                {loadingEditId === s.id ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="m18.5 2.5 2 2L10 15H8v-2z" />
                  </svg>
                )}
                {t('edit')}
              </Button>

              <Button
                onClick={() => onDelete({ id: s.id, name })}
                title="Delete Chain"
                variant="danger"
                size="icon"
                className="shrink-0 bg-transparent text-red-500 border border-red-200 hover:bg-red-50 hover:text-red-600 shadow-none"
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
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="m10 11 0 6m4-6 0 6" />
                  <path d="m9 6 1-3h4l1 3" />
                </svg>
              </Button>
            </div>
          </div>
        );
      })}

      <div
        onClick={onAdd}
        className="bg-[#FAF8F5]/60 border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all min-h-[220px] group"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-border group-hover:border-[#1B4332] flex items-center justify-center text-text-primary text-xl font-light transition-colors shadow-xs">
          +
        </div>
        <div>
          <h3 className="text-base font-extrabold text-text-primary m-0 mb-1 group-hover:text-[#1B4332]">
            {t('registerNew')}
          </h3>
          <p className="text-xs text-slate-500 m-0 max-w-[220px] leading-relaxed">
            {t('registerNewDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
