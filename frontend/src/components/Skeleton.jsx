export function SkeletonPulse({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-10 w-10 rounded-xl" />
          </div>
          <SkeletonPulse className="h-8 w-20 mb-1.5" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <SkeletonPulse className="h-4 w-36" />
        <SkeletonPulse className="h-7 w-24 rounded-full" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonPulse
                key={c}
                className={`h-4 ${c === 0 ? 'w-28 rounded-lg' : c === cols - 1 ? 'w-20 ml-auto rounded-full' : 'flex-1 rounded-lg'}`}
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
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonPulse className="h-3.5 w-full mb-2.5 rounded-lg" />
          <SkeletonPulse className="h-3.5 w-3/4 mb-4 rounded-lg" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-7 w-20 rounded-lg" />
            <SkeletonPulse className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
