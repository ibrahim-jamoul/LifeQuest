import { X } from "lucide-react";

export function Toast({ message, onClose, tone = "success" }: { message: string; onClose?: () => void; tone?: "success" | "error" | "info" }) {
  const style = tone === "success" ? "border-success/30 bg-success-bg text-primary" : tone === "error" ? "border-danger/30 bg-danger-bg text-danger" : "border-ocean/30 bg-ocean/10 text-ocean";
  return <div role="status" aria-live={tone === "error" ? "assertive" : "polite"} className={`flex items-center justify-between gap-3 rounded-cozy-md border-2 p-3 text-sm font-bold ${style}`}><span>{message}</span>{onClose ? <button aria-label="Dismiss message" onClick={onClose}><X className="size-4" /></button> : null}</div>;
}
