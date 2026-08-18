import { getLocalString } from '@lib/formatters';
import { BRANCH_COUNTS } from '@constants/supermarketData';
import type { Supermarket } from '@typeDefs/catalogTypes';
import { SupermarketLogo } from './SupermarketLogo';
import { Button } from '@components/ui/Button';

interface TableViewProps {
  supermarkets: Supermarket[];
  loadingEditId: string | null;
  onEdit: (s: Supermarket) => void;
  onDelete: (target: { id: string; name: string }) => void;
}

export function TableView({ supermarkets, loadingEditId, onEdit, onDelete }: TableViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3">Supermarket Chain</th>
              <th className="px-5 py-3">Branches</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Scraper Endpoint</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE5D9]">
            {supermarkets.map((s) => {
              const name = getLocalString(s.name);
              const branches = s.branches ?? BRANCH_COUNTS[name] ?? 0;
              const fbUrl = s.websiteUrl || 'facebook.com/supermarket/offers';

              return (
                <tr key={s.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <SupermarketLogo
                        logoPath={s.logoPath}
                        name={name}
                        className="w-9 h-9 text-xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-text-primary">{name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {s.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 bg-surface-variant border border-border rounded-2xl text-[11px] font-bold text-text-primary whitespace-nowrap">
                      {branches} Branches
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {s.address || 'Cairo, Egypt'}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                    {fbUrl.replace(/^https?:\/\//, '')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => onEdit(s)}
                        disabled={loadingEditId === s.id}
                        variant="outline"
                        size="sm"
                      >
                        {loadingEditId === s.id ? 'Loading…' : 'Edit'}
                      </Button>
                      <Button
                        onClick={() => onDelete({ id: s.id, name })}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </Button>
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
