import { getLocalizedName } from '@/utils/categoryHelpers';
import { getImageUrl } from '@lib/formatters';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/Button';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { useTranslation } from 'react-i18next';
import { TableRow, TableCell } from '@components/ui/Table';

interface CategoryRowProps {
  category: ProductCategory;
  onEdit: (cat: ProductCategory) => void;
  onUpload: (catId: string) => void;
  onDelete: (cat: ProductCategory) => void;
  loadingEditId?: string | null;
}

export function CategoryRow({
  category,
  onEdit,
  onUpload,
  onDelete,
  loadingEditId,
}: CategoryRowProps) {
  const { t, i18n } = useTranslation('categories');
  const en = getLocalizedName(category.name, 'en');
  const ar = getLocalizedName(category.name, 'ar');
  const isArabicActive = i18n.resolvedLanguage === 'ar';
  const primary = isArabicActive ? ar : en;
  const secondary = isArabicActive ? en : ar;
  const imgUrl = getImageUrl(category.imagePath);
  const count = category.itemCount || category.productsCount || 0;

  return (
    <TableRow>
      <TableCell>
        {imgUrl ? (
          <>
            <img
              src={imgUrl}
              alt={primary}
              className="w-10 h-10 rounded-3xl object-cover bg-surface-variant border border-border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                e.currentTarget.nextElementSibling?.classList.add('flex');
              }}
            />
            <div className="hidden flex-col items-center justify-center w-10 h-10 rounded-3xl bg-surface-variant border border-border text-text-disabled font-bold text-xs">
              {primary?.charAt(0).toUpperCase()}
            </div>
          </>
        ) : (
          <div className="flex w-10 h-10 rounded-3xl bg-surface-variant border border-border items-center justify-center text-text-disabled font-bold text-xs">
            {primary?.charAt(0).toUpperCase()}
          </div>
        )}
      </TableCell>
      <TableCell
        className={cn(
          isArabicActive ? 'text-end font-bold text-text-primary' : 'font-bold text-text-primary'
        )}
        dir={isArabicActive ? 'rtl' : 'ltr'}
      >
        {primary}
      </TableCell>
      <TableCell
        className={cn('font-semibold text-text-secondary', isArabicActive ? '' : 'text-end')}
        dir={isArabicActive ? 'ltr' : 'rtl'}
      >
        {secondary || '—'}
      </TableCell>
      <TableCell className="font-bold text-text-primary">{t('items', { count })}</TableCell>
      <TableCell className="text-end">
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={() => onEdit(category)}
            disabled={loadingEditId === category.id}
            title={t('editCategory')}
            variant="ghost"
            size="icon"
          >
            {loadingEditId === category.id ? (
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
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
            className="text-status-error hover:bg-status-error-container"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
