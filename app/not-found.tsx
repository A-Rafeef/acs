import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="rounded-full bg-secondary p-4">
        <SearchX className="h-8 w-8 text-foreground/40" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          Page Not Found
        </h2>
        <p className="text-xs text-foreground/45 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-all rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Browse the Catalog
      </Link>
    </div>
  )
}
