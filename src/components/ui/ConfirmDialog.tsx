import { cn } from '@lib/utils';
import { Modal } from './Modal';

export function ConfirmDialog({
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading,
}: {
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Modal title={title} onClose={onCancel} isOpen={true}>
      <p className="text-text-secondary text-sm mb-24 m-0">{message}</p>
      <div className="flex justify-end gap-12">
        <button
          onClick={onCancel}
          className="px-20 py-2.5 bg-transparent border-[1.5px] border-border rounded-lg text-sm cursor-pointer hover:bg-surface-variant transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'px-20 py-2.5 border-none rounded-lg bg-status-error text-white text-sm font-semibold transition-opacity',
            loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
          )}
        >
          {loading ? 'Processing…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
