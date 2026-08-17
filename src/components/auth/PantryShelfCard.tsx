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
      <div className="w-12 h-4 rounded-t-sm bg-border shrink-0" />
      <div className="w-20 flex-1 rounded-b-md border border-border/60 bg-surface-variant/40 overflow-hidden relative">
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
      <div className="flex items-end justify-center gap-12 px-4">
        {jars.map((jar, i) => (
          <Jar key={i} {...jar} />
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-border/50 mt-4" />
    </div>
  );
}

export function PantryShelfCard() {
  return (
    <div className="mt-40 w-full max-w-xs bg-surface rounded-lg shadow-xl p-20 motion-safe:animate-[slideUp_0.6s_ease-out_240ms_both]">
      <div className="flex items-center justify-between mb-16">
        <span className="text-typography-label text-text-secondary uppercase tracking-widest">
          Pantry
        </span>
        <span className="text-typography-caption text-text-disabled">12 items</span>
      </div>

      <div className="flex flex-col gap-20">
        <Shelf jars={topShelf} />
        <Shelf jars={bottomShelf} />
      </div>

      <div className="mt-16 pt-16 border-t border-border flex items-center justify-between">
        <span className="text-typography-caption text-text-disabled">2 running low</span>
        <span className="text-typography-label text-primary">HomePal</span>
      </div>
    </div>
  );
}
