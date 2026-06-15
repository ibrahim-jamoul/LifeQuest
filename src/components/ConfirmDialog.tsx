import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void | Promise<void>; onClose: () => void }) {
  return <Modal open={open} title={title} description={description} onClose={onClose}>
    <div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={() => void onConfirm()}>{confirmLabel}</Button></div>
  </Modal>;
}
