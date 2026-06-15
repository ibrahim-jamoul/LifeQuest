import { X } from "lucide-react";

export function CozyToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-[20px] border-2 border-[#b9dab0] bg-[#edf7e9] px-4 py-3 text-sm font-extrabold text-[#47783b] shadow-panel">{message}<button aria-label="Close notification" onClick={onClose}><X className="size-4"/></button></div>;
}
