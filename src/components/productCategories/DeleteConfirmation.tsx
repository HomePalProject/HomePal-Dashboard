import { Button } from '@components/ui/Button';

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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-1">Confirm Deletion</h3>
        <p className="mb-6 text-slate-700">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={loading} variant="danger" size="sm">
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
