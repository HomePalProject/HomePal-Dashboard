import { getLocalizedName } from '@/utils/categoryHelpers';
import { getImageUrl } from '@lib/formatters';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/Button';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { useTranslation } from 'react-i18next';

interface CategoryCardProps {
  category: ProductCategory;
  onEdit: (cat: ProductCategory) => void;
  onUpload: (catId: string) => void;
  onDelete: (cat: ProductCategory) => void;
  loadingEditId?: string | null;
}

export function CategoryCard({
  category,
  onEdit,
  onUpload,
  onDelete,
  loadingEditId,
}: CategoryCardProps) {
  const { t, i18n } = useTranslation('categories');
  const en = getLocalizedName(category.name, 'en');
  const ar = getLocalizedName(category.name, 'ar');
  const isArabicActive = i18n.resolvedLanguage === 'ar';
  const primary = isArabicActive ? ar : en;
  const secondary = isArabicActive ? en : ar;
  const imgUrl = getImageUrl(category.imagePath ?? undefined);

  return (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-slate-100 hover:border-primary/20 relative hover:-translate-y-1">
      {/* Image Cover */}
      <div className="relative w-full aspect-4/3 bg-slate-50 overflow-hidden">
        {imgUrl ? (
          <>
            <img
              src={imgUrl}
              alt={primary}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                e.currentTarget.nextElementSibling?.classList.add('flex');
              }}
            />
            <div className="hidden flex-col items-center justify-center h-full w-full gap-2 text-slate-300 bg-linear-to-br from-slate-50 to-slate-100 absolute inset-0">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {primary?.charAt(0).toUpperCase()}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full gap-2 text-slate-300 bg-linear-to-br from-slate-50 to-slate-100">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {primary?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-1 bg-white">
        <div>
          <h3
            className={cn(
              'text-[15px] font-black text-slate-900 truncate',
              isArabicActive && 'text-end font-arabic'
            )}
            dir={isArabicActive ? 'rtl' : 'ltr'}
            title={primary}
          >
            {primary || t('untitledCategory')}
          </h3>
          {secondary && (
            <p
              className={cn(
                'text-[13px] font-bold text-slate-400 mt-1',
                isArabicActive ? 'text-start' : 'text-end font-arabic'
              )}
              dir={isArabicActive ? 'ltr' : 'rtl'}
            >
              {secondary}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
          <Button
            onClick={() => onEdit(category)}
            disabled={loadingEditId === category.id}
            title={t('editCategory')}
            variant="ghost"
            size="icon"
          >
            {loadingEditId === category.id ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-9-9" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          </Button>
          <Button
            onClick={() => onUpload(category.id)}
            title={t('uploadCover')}
            variant="ghost"
            size="icon"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </Button>
          <Button
            onClick={() => onDelete(category)}
            title={t('deleteCategory')}
            variant="ghost"
            size="icon"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
