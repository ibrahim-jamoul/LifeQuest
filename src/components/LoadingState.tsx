export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <div role="status" className="panel min-h-48 space-y-4 p-6 text-text-secondary"><span className="sr-only">{label}</span><div className="h-6 w-2/5 animate-pulse rounded-cozy-sm bg-cream-secondary" /><div className="h-20 animate-pulse rounded-cozy-lg bg-cream-secondary" /><div className="h-20 animate-pulse rounded-cozy-lg bg-cream-secondary" /></div>;
}
