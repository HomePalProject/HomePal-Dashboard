import { Button } from '@components/ui/Button';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: DeleteConfirmationProps) {
  const { t } = useTranslation(['categories', 'common']);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-1">{t('deleteTitle')}</h3>
        <p className="mb-6 text-slate-700">{t('deleteMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" size="sm">
            {t('common:cancel')}
          </Button>
          <Button onClick={onConfirm} isLoading={loading} variant="danger" size="sm">
            {loading ? t('deleting') : t('delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
