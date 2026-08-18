import { getLocalizedName } from '@/utils/categoryHelpers';
import { getImageUrl } from '@lib/formatters';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';

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
      {categories.map((cat) => {
        const en = getLocalizedName(cat.name, 'en');
        const ar = getLocalizedName(cat.name, 'ar');
        const imgUrl = getImageUrl(cat.imagePath ?? undefined);
        return (
          <div
            key={cat.id}
            className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-slate-100 hover:border-[#1F3D32]/20 relative hover:-translate-y-1"
          >
            {/* Image Cover */}
            <div className="relative w-full aspect-4/3 bg-slate-50 overflow-hidden">
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt={en}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      e.currentTarget.nextElementSibling?.classList.add('flex');
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center h-full w-full gap-2 text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 absolute inset-0">
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
                    {en?.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full gap-2 text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
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
                  {en?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
              <div>
                <h3 className="text-[15px] font-black text-slate-900 truncate" title={en}>
                  {en || 'Untitled Category'}
                </h3>
                {ar && (
                  <p
                    className="text-[13px] font-bold text-slate-400 mt-1 text-right font-arabic"
                    dir="rtl"
                  >
                    {ar}
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-50">
                <button
                  onClick={() => onEdit(cat)}
                  disabled={loadingEditId === cat.id}
                  title="Edit Category"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-600 hover:text-[#1F3D32] hover:bg-[#1F3D32]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingEditId === cat.id ? (
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
                </button>
                <button
                  onClick={() => onUpload(cat.id)}
                  title="Upload Cover Image"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
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
                </button>
                <button
                  onClick={() => onDelete(cat)}
                  title="Delete Category"
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
