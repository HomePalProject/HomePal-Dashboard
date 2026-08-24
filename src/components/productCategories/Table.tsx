import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { useTranslation } from 'react-i18next';
import { CategoryRow } from './CategoryRow';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@components/ui/Table';

interface TableProps {
  categories: ProductCategory[];
  onEdit: (cat: ProductCategory) => void;
  onUpload: (catId: string) => void;
  onDelete: (cat: ProductCategory) => void;
  loadingEditId?: string | null;
}

export default function TableView({
  categories,
  onEdit,
  onUpload,
  onDelete,
  loadingEditId,
}: TableProps) {
  const { t, i18n } = useTranslation('categories');
  const isArabicActive = i18n.resolvedLanguage === 'ar';

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t('tableHeaderCover')}</TableHead>
            <TableHead>{isArabicActive ? t('tableHeaderAr') : t('tableHeaderEn')}</TableHead>
            <TableHead className="text-end">
              {isArabicActive ? t('tableHeaderEn') : t('tableHeaderAr')}
            </TableHead>
            <TableHead>{t('tableHeaderCount')}</TableHead>
            <TableHead className="text-end">{t('tableHeaderActions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onEdit={onEdit}
              onUpload={onUpload}
              onDelete={onDelete}
              loadingEditId={loadingEditId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
