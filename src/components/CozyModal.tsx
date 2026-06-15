import type { ReactNode } from "react";
import { X } from "lucide-react";

export function CozyModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-[#3f3528]/35 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-label={title} className="panel w-full max-w-xl p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2><button aria-label="Close modal" className="button-secondary p-2" onClick={onClose}><X className="size-4"/></button></div><div className="mt-4">{children}</div></section></div>;
}
