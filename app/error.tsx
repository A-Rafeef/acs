'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          Something went wrong
        </h2>
        <p className="text-xs text-foreground/45 max-w-sm">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-all rounded-sm"
        >
          <RotateCcw className="h-3 w-3" /> Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-foreground text-background px-6 py-3 hover:bg-foreground/80 transition-all rounded-sm"
        >
          <Home className="h-3 w-3" /> Go Home
        </Link>
      </div>
    </div>
  )
}
