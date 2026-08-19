import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { useTranslation } from 'react-i18next';
import { CategoryRow } from './CategoryRow';

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
  const { t } = useTranslation('categories');
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-16 py-3 whitespace-nowrap">{t('tableHeaderCover')}</th>
              <th className="px-16 py-3 whitespace-nowrap">{t('tableHeaderEn')}</th>
              <th className="px-16 py-3 text-end whitespace-nowrap">{t('tableHeaderAr')}</th>
              <th className="px-16 py-3 whitespace-nowrap">{t('tableHeaderCount')}</th>
              <th className="px-16 py-3 text-end whitespace-nowrap">{t('tableHeaderActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
