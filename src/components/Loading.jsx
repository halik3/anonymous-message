export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-zinc-400" role="status">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        {label}
      </div>
    </div>
  )
}
