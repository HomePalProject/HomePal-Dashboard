import { getLocalString, getLocalizedCulture } from '@lib/formatters';
import type { Supermarket } from '@typeDefs/catalogTypes';
import { SupermarketLogo } from './SupermarketLogo';
import { Button } from '@components/ui/Button';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@components/ui/Table';

interface TableViewProps {
  supermarkets: Supermarket[];
  loadingEditId: string | null;
  onEdit: (s: Supermarket) => void;
  onDelete: (target: { id: string; name: string }) => void;
}

export function TableView({ supermarkets, loadingEditId, onEdit, onDelete }: TableViewProps) {
  const { t, i18n } = useTranslation(['supermarkets', 'common']);
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t('tableHeaderChain')}</TableHead>
            <TableHead>{t('tableHeaderLocation')}</TableHead>
            <TableHead>{t('tableHeaderEndpoint')}</TableHead>
            <TableHead className="text-end">{t('tableHeaderActions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supermarkets.map((s) => {
            const name =
              getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') ||
              getLocalString(s.name);
            const fbUrl = s.websiteUrl || 'facebook.com/supermarket/offers';

            return (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <SupermarketLogo
                      logoPath={s.logoPath}
                      name={name}
                      className="w-9 h-9 text-xs"
                    />
                    <div>
                      <div className="text-sm font-bold text-text-primary">{name}</div>
                      <div className="text-xs text-text-disabled font-mono mt-0.5">
                        {t('idPrefix')}
                        {s.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary">{s.address || 'Cairo, Egypt'}</TableCell>
                <TableCell className="font-mono text-text-secondary">
                  {fbUrl.replace(/^https?:\/\//, '')}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => onEdit(s)}
                      disabled={loadingEditId === s.id}
                      variant="outline"
                      size="sm"
                    >
                      {loadingEditId === s.id ? t('common:loading', 'Loading…') : t('edit')}
                    </Button>
                    <Button onClick={() => onDelete({ id: s.id, name })} variant="danger" size="sm">
                      {t('delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
