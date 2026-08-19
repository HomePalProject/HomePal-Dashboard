import { useTranslation } from 'react-i18next';

interface JarSpec {
  height: number;
  fill: number;
  low?: boolean;
}

const topShelf: JarSpec[] = [
  { height: 44, fill: 85 },
  { height: 52, fill: 70 },
  { height: 40, fill: 20, low: true },
  { height: 48, fill: 60 },
];

const bottomShelf: JarSpec[] = [
  { height: 50, fill: 65 },
  { height: 44, fill: 15, low: true },
  { height: 56, fill: 80 },
];

function Jar({ height, fill, low }: JarSpec) {
  return (
    <div className="flex flex-col items-center" style={{ height }}>
      <div className="w-3 h-1 rounded-t-3xl bg-border shrink-0" />
      <div className="w-5 flex-1 rounded-b-2xl border border-border/60 bg-surface-variant/40 overflow-hidden relative">
        <div
          className={`absolute bottom-0 left-0 right-0 ${low ? 'bg-accent-container' : 'bg-primary-container'}`}
          style={{ height: `${fill}%` }}
        />
      </div>
    </div>
  );
}

function Shelf({ jars }: { jars: JarSpec[] }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-center gap-3 px-1">
        {jars.map((jar, i) => (
          <Jar key={i} {...jar} />
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-border/50 mt-1" />
    </div>
  );
}

export function PantryShelfCard() {
  const { t } = useTranslation('auth');

  return (
    <div className="mt-10 w-full max-w-xs bg-surface rounded-3xl shadow-xl p-5 motion-safe:animate-[slideUp_0.6s_ease-out_240ms_both]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-typography-label text-text-secondary uppercase tracking-widest">
          {t('pantry')}
        </span>
        <span className="text-typography-caption text-text-disabled">
          {t('pantryItems', { count: 12 })}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <Shelf jars={topShelf} />
        <Shelf jars={bottomShelf} />
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-typography-caption text-text-disabled">
          {t('runningLow', { count: 2 })}
        </span>
        <span className="text-typography-label text-primary">{t('common:homepal')}</span>
      </div>
    </div>
  );
}
