export default function AdminLoading() {
  return (
    <div className="flex h-[75vh] w-full items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/45">
          Loading Admin
        </p>
      </div>
    </div>
  )
}
