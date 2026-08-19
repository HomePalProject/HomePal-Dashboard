import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { CategoryCard } from './CategoryCard';

interface GridProps {
  categories: ProductCategory[];
  onEdit: (cat: ProductCategory) => void;
  onUpload: (catId: string) => void;
  onDelete: (cat: ProductCategory) => void;
  loadingEditId?: string | null;
}

export default function GridView({
  categories,
  onEdit,
  onUpload,
  onDelete,
  loadingEditId,
}: GridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onEdit={onEdit}
          onUpload={onUpload}
          onDelete={onDelete}
          loadingEditId={loadingEditId}
        />
      ))}
    </div>
  );
}
