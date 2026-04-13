export function RaffleCardSkeleton() {
  return (
    <div className="bg-brand-cream-light rounded-xl shadow-md overflow-hidden border-2 border-brand-cream-border">
      <div className="h-1 bg-brand-gold" />
      <div className="h-48 w-full bg-brand-cream-dark animate-pulse" />
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-brand-cream-dark rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-brand-cream-dark rounded w-full animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-brand-cream-dark rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-brand-cream-dark rounded w-24 animate-pulse" />
            <div className="h-4 bg-brand-cream-dark rounded w-12 animate-pulse" />
          </div>
          <div className="h-2 bg-brand-cream-dark rounded-full w-full animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-brand-cream-dark rounded w-20 animate-pulse" />
          <div className="h-4 bg-brand-cream-dark rounded w-24 animate-pulse" />
        </div>
        <div className="h-10 bg-brand-cream-dark rounded-lg w-full animate-pulse" />
      </div>
    </div>
  );
}

export function RaffleGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <RaffleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedRaffleSkeleton() {
  return (
    <div className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border p-4 space-y-4">
      <div className="h-1 bg-brand-gold" />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-48 sm:h-64 w-full sm:w-1/2 bg-brand-cream-dark rounded-lg animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-brand-cream-dark rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-brand-cream-dark rounded w-full animate-pulse" />
          <div className="h-4 bg-brand-cream-dark rounded w-2/3 animate-pulse" />
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="h-20 bg-brand-cream-dark rounded-lg animate-pulse" />
            <div className="h-20 bg-brand-cream-dark rounded-lg animate-pulse" />
            <div className="h-20 bg-brand-cream-dark rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketSkeleton() {
  return (
    <div className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-cream-dark rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-brand-cream-dark rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-brand-cream-dark rounded w-1/2 animate-pulse" />
        </div>
        <div className="w-16 h-6 bg-brand-cream-dark rounded-full animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="w-12 h-8 bg-brand-cream-dark rounded animate-pulse" />
        <div className="w-12 h-8 bg-brand-cream-dark rounded animate-pulse" />
        <div className="w-12 h-8 bg-brand-cream-dark rounded animate-pulse" />
      </div>
    </div>
  );
}

export function TicketsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TicketSkeleton key={i} />
      ))}
    </div>
  );
}
