import { cn } from '@lib/utils';

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
    <div className="flex gap-12 mt-8">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 bg-transparent border-[1.5px] border-border rounded-lg text-sm font-semibold text-text-secondary cursor-pointer hover:bg-surface-variant transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className={cn(
          'flex-1 py-2.5 bg-primary text-white border-none rounded-lg text-sm font-semibold transition-opacity',
          saving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
        )}
      >
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}
