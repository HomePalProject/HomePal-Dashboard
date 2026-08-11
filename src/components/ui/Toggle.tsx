import { cn } from '@lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export function Toggle({ checked, onChange, disabled = false, title, className }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      disabled={disabled}
      title={title}
      className={cn(
        'w-11 h-24 rounded-full border-none cursor-pointer relative p-[2px] transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-surface-variant',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'block w-20 h-20 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200',
          checked ? 'translate-x-20' : 'translate-x-0'
        )}
      />
    </button>
  );
}
