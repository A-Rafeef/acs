export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/45">
          Loading
        </p>
      </div>
    </div>
  )
}
