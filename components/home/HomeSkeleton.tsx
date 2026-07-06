// Skeleton components for home page sections

export function CollectionsSkeleton() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="h-3 w-24 bg-secondary rounded mx-auto animate-pulse" />
        <div className="h-7 w-52 bg-secondary rounded mx-auto animate-pulse" />
        <div className="mx-auto h-[1.5px] w-12 bg-secondary animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative h-[400px] w-full bg-secondary rounded-sm animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="h-3 w-16 bg-foreground/10 rounded" />
              <div className="h-4 w-28 bg-foreground/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CarouselSkeleton() {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-end justify-between border-b border-border/20 pb-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-secondary rounded animate-pulse" />
            <div className="h-7 w-36 bg-secondary rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
          </div>
        </div>
        <div className="flex space-x-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[280px] sm:w-[320px] flex-shrink-0 space-y-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[3/4] w-full bg-secondary rounded-sm animate-pulse" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-16 bg-secondary rounded animate-pulse" />
                </div>
                <div className="h-2.5 w-24 bg-secondary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CuratorPicksSkeleton() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 border-t border-border/10">
      <div className="text-center space-y-3">
        <div className="h-3 w-24 bg-secondary rounded mx-auto animate-pulse" />
        <div className="h-7 w-40 bg-secondary rounded mx-auto animate-pulse" />
        <div className="mx-auto h-[1.5px] w-12 bg-secondary animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="aspect-[3/4] w-full bg-secondary rounded-sm animate-pulse" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-28 bg-secondary rounded animate-pulse" />
                <div className="h-3 w-14 bg-secondary rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-20 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
