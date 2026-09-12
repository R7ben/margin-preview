import { useEffect, useRef, useState } from "react";

/** Props for the pre-save commitment capacity confirmation modal. */
export type ConfirmAddCommitmentModalProps = {
  taskName: string;
  taskDuration: number;
  currentAvailable: number;
  recoveryFloor: number;
  fixedCommitments: number;
  totalCommitted: number;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Shows commitment impact before the parent saves the commitment. */
export const ConfirmAddCommitmentModal = ({
  taskName,
  taskDuration,
  currentAvailable,
  totalCommitted,
  onConfirm,
  onCancel,
}: ConfirmAddCommitmentModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);
  const hoursRemaining = currentAvailable - taskDuration;
  const percentAfter = ((totalCommitted + taskDuration) / 168) * 100;
  const displayPercent = `${Math.round(percentAfter)}%`;
  const boundedPercent = Math.min(100, Math.max(0, percentAfter));
  const isOverload = percentAfter > 90;
  const isTight = !isOverload && percentAfter > 70;
  const tone = isOverload ? "overload" : isTight ? "tight" : "good";
  const message = isOverload
    ? `You'll be at ${displayPercent} capacity — this is overload.`
    : isTight
      ? `You'll be at ${displayPercent} capacity — tight, but doable.`
      : `You'll be at ${displayPercent} capacity — you're good.`;

  useEffect(() => {
    setVisible(true);
    const animationFrame = window.requestAnimationFrame(() => setRingProgress(boundedPercent));
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
      if (event.key === "Tab" && event.shiftKey && document.activeElement === cancelRef.current) event.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [boundedPercent, onCancel]);

  const close = () => {
    setVisible(false);
    window.setTimeout(onCancel, 200);
  };
  const invalid = taskDuration <= 0;
  const tooLong = taskDuration > 168;
  const noCapacity = currentAvailable <= 0;

  return (
    <div className={`confirm-commitment-backdrop${visible ? " confirm-commitment-visible" : ""}`} role="dialog" aria-modal="true" aria-labelledby="confirm-commitment-title" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="confirm-commitment-modal" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="confirm-commitment-title">Are you sure?</h2>
        <p className="confirm-commitment-subtitle">{taskName} will impact your week</p>
        <div className={`confirm-commitment-ring confirm-commitment-ring-${tone}`} role="img" aria-label={`${displayPercent} capacity`}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle className="confirm-commitment-ring-track" cx="100" cy="100" r="92" />
            <circle className="confirm-commitment-ring-fill" cx="100" cy="100" r="92" pathLength="100" style={{ strokeDashoffset: `${100 - ringProgress}` }} />
          </svg>
          <strong>{displayPercent}</strong><span>capacity</span>
        </div>
        <p className={`confirm-commitment-message confirm-commitment-message-${tone}`}>{message}</p>
        <div className="confirm-commitment-breakdown">
          <div><span>Current available</span><strong>{currentAvailable.toFixed(1)} hrs</strong></div>
          <div><span>This task</span><strong>{taskDuration.toFixed(1)} hrs</strong></div>
          <div><span>After adding</span><strong>{displayPercent} of your week</strong></div>
        </div>
        {(tooLong || invalid || noCapacity) && <p className="confirm-commitment-warning">{tooLong ? "This task is longer than a week." : invalid ? "Task duration must be greater than zero." : "No capacity left this week — defer or reschedule another task."}</p>}
        <div className="confirm-commitment-actions">
          <button ref={cancelRef} type="button" className="confirm-commitment-cancel" onClick={close}>Cancel</button>
          <button type="button" className="confirm-commitment-confirm" onClick={onConfirm} disabled={tooLong || invalid}>Yes, Add It</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAddCommitmentModal;
