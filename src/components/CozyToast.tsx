import { X } from "lucide-react";

export function CozyToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-cozy-md border-2 border-border bg-cream-secondary px-4 py-3 text-sm font-extrabold text-text-secondary shadow-panel">{message}<button aria-label="Close notification" onClick={onClose}><X className="size-4"/></button></div>;
}
