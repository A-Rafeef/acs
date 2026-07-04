export default function BrandStory() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'MINIMALIST THRIFT'

  return (
    <section id="about" className="py-24 border-t border-border/10 bg-background transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20 items-start">
          {/* Title block */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/45 block">
              Our Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
              A Circular <br className="hidden sm:inline" />
              Approach <br />
              to Archival Fashion.
            </h2>
          </div>

          {/* Description block */}
          <div className="lg:col-span-7 text-sm text-foreground/60 leading-relaxed font-light space-y-6">
            <p>
              At {storeName}, we believe that garments carry histories, and exceptional design should endure across lifetimes. Traditional fast fashion leads to colossal environmental degradation; we champion an alternative built around curating and extending the lifecycle of premium, rare garments.
            </p>
            <p>
              Every single piece in our collection is handpicked, thoroughly inspected for quality, and authenticated. Since each garment is a 1-of-1 archival artifact, there are no restocking or duplicating runs. Once a item is sold, it is gone forever, moving forward to its next owner in the cycle of sustainable circular fashion.
            </p>
            
            {/* Minimal Stat block */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/10">
              <div className="space-y-1">
                <span className="block text-xl font-bold text-foreground">1-of-1</span>
                <span className="block text-[9px] uppercase tracking-wider text-foreground/45 font-bold">Guaranteed Unique</span>
              </div>
              <div className="space-y-1">
                <span className="block text-xl font-bold text-foreground">100%</span>
                <span className="block text-[9px] uppercase tracking-wider text-foreground/45 font-bold">Inspected & Sanitized</span>
              </div>
              <div className="space-y-1">
                <span className="block text-xl font-bold text-foreground">0%</span>
                <span className="block text-[9px] uppercase tracking-wider text-foreground/45 font-bold">New Fabric Waste</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
