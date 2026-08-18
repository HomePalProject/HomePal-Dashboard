import { Button } from './Button';

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
    <div className="flex gap-3 mt-6">
      <Button variant="secondary" onClick={onCancel} type="button" fullWidth>
        Cancel
      </Button>
      <Button variant="primary" type="submit" isLoading={saving} fullWidth>
        {label}
      </Button>
    </div>
  );
}
