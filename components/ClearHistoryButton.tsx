"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { clearAllAnalysisHistory } from "../app/history/actions";

interface ClearHistoryButtonProps {
  hasRecords: boolean;
}

export default function ClearHistoryButton({ hasRecords }: ClearHistoryButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirmOpen && !dialog.open) dialog.showModal();
    else if (!confirmOpen && dialog.open) dialog.close();
  }, [confirmOpen]);

  function confirmClearHistory() {
    if (pending) return;
    setConfirmOpen(false);
    setMessage(null);
    startTransition(async () => {
      const result = await clearAllAnalysisHistory();
      setMessage({ success: result.success, text: result.message });
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="history-actions">
      {hasRecords && (
        <button className="btn history-clear-button" type="button" onClick={() => setConfirmOpen(true)} disabled={pending}>
          {pending ? "Clearing history..." : "Clear All History"}
        </button>
      )}
      {confirmOpen && (
        <dialog ref={dialogRef} className="history-confirm" aria-labelledby="history-confirm-title" aria-describedby="history-confirm-description" onCancel={(event) => {
          event.preventDefault();
          setConfirmOpen(false);
        }}>
          <h2 id="history-confirm-title">Clear all analysis history?</h2>
          <p id="history-confirm-description">This permanently deletes all analysis records saved to your account. This action cannot be undone.</p>
          <div className="history-confirm-actions">
            <button className="btn" type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="btn primary" type="button" onClick={confirmClearHistory} disabled={pending}>
              {pending ? "Clearing..." : "Confirm"}
            </button>
          </div>
        </dialog>
      )}
      {message && (
        <p className={message.success ? "history-action-message success" : "history-action-message error"} role={message.success ? "status" : "alert"}>
          {message.text}
        </p>
      )}
    </div>
  );
}
