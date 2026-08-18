import { Button } from '@components/ui/Button';

export function ModalActions({
  onCancel,
  saving,
  label,
}: {
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-3 mt-2">
      <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
        Cancel
      </Button>
      <Button type="submit" disabled={saving} isLoading={saving} className="flex-1">
        {label}
      </Button>
    </div>
  );
}
