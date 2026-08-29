export function SkeletonPulse({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <SkeletonPulse className="h-3 w-20" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
          </div>
          <SkeletonPulse className="h-7 w-16 mb-1" />
          <SkeletonPulse className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-6 w-20 rounded-full" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonPulse
                key={c}
                className={`h-3.5 ${c === 0 ? 'w-24' : c === cols - 1 ? 'w-16 ml-auto' : 'flex-1'}`}
                style={{ animationDelay: `${r * 0.05}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between mb-3">
            <SkeletonPulse className="h-4 w-28" />
            <SkeletonPulse className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonPulse className="h-3 w-full mb-2" />
          <SkeletonPulse className="h-3 w-3/4 mb-3" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-6 w-16 rounded" />
            <SkeletonPulse className="h-6 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
