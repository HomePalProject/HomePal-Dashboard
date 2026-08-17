import { getLocalizedName } from '@/utils/categoryHelpers';
import { getImageUrl } from '@lib/formatters';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';

interface TableProps {
  categories: ProductCategory[];
  onEdit: (cat: ProductCategory) => void;
  onUpload: (catId: string) => void;
  loadingEditId?: string | null;
}

export default function TableView({ categories, onEdit, onUpload, loadingEditId }: TableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-16 py-3">Cover</th>
              <th className="px-16 py-3">English Name</th>
              <th className="px-16 py-3 text-right">Arabic Name</th>
              <th className="px-16 py-3">Items Count</th>
              <th className="px-16 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {categories.map((cat) => {
              const en = getLocalizedName(cat.name, 'en');
              const ar = getLocalizedName(cat.name, 'ar');
              const imgUrl = getImageUrl(cat.imagePath);
              const count = cat.itemCount || cat.productsCount || 0;
              return (
                <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-16 py-3">
                    {imgUrl ? (
                      <>
                        <img
                          src={imgUrl}
                          alt={en}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            e.currentTarget.nextElementSibling?.classList.add('flex');
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs">
                          {en?.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="flex w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 items-center justify-center text-slate-400 font-bold text-xs">
                        {en?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-16 py-3 font-bold text-slate-900">{en}</td>
                  <td className="px-16 py-3 text-right font-semibold text-slate-600" dir="rtl">
                    {ar || '—'}
                  </td>
                  <td className="px-16 py-3 font-bold text-slate-800">{count} Items</td>
                  <td className="px-16 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(cat)}
                        disabled={loadingEditId === cat.id}
                        title="Edit Category"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingEditId === cat.id ? (
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
                      </button>
                      <button
                        onClick={() => onUpload(cat.id)}
                        title="Upload Cover Image"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-none bg-transparent"
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
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
