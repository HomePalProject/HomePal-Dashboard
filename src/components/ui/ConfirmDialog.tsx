import { Modal } from './Modal';
import { Button } from './Button';

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
      <p className="text-text-secondary text-sm mb-6 m-0">{message}</p>
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} variant="outline" size="md">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="danger" size="md" isLoading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
