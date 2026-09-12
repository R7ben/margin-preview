import { useEffect, useRef, useState } from "react";

/** Props for the pre-save commitment capacity confirmation modal. */
export type ConfirmAddCommitmentModalProps = {
  taskName: string;
  taskDuration: number;
  currentAvailable: number;
  recoveryFloor: number;
  fixedCommitments: number;
  totalCommitted: number;
  deferrableTasks?: Array<{ id: number; name: string; estimatedHours: number }>;
  onConfirm: () => void;
  onCancel: () => void;
  onDeferTask?: (task: { id: number; name: string; estimatedHours: number }) => void;
};

/** Shows commitment impact before the parent saves the commitment. */
export const ConfirmAddCommitmentModal = ({
  taskName,
  taskDuration,
  currentAvailable,
  totalCommitted,
  deferrableTasks = [],
  onConfirm,
  onCancel,
  onDeferTask,
}: ConfirmAddCommitmentModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);
  const [deferredCount, setDeferredCount] = useState(0);
  const hoursRemaining = currentAvailable - taskDuration;
  const percentAfter = ((totalCommitted + taskDuration) / 168) * 100;
  const displayPercent = `${Math.round(percentAfter)}%`;
  const boundedPercent = Math.min(100, Math.max(0, percentAfter));
  const isOverload = percentAfter > 90;
  const isTight = !isOverload && percentAfter > 70;
  const tone = isOverload ? "overload" : isTight ? "tight" : "good";
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
  const blocked = tooLong || invalid || hoursRemaining <= 0;
  const recoveryNudge = percentAfter > 90
    ? "You're overloaded. This won't work without rescheduling other tasks. (See deferrables below)"
    : percentAfter >= 80
      ? "You're running tight this week. Consider rescheduling lower-priority work to protect your recovery time."
      : null;
  const message = blocked
    ? "Reschedule or defer a task below to make room."
    : isOverload
      ? "This is tight. Consider rescheduling other tasks."
      : isTight
        ? "Tight, but doable."
        : "You're good.";

  const deferTask = (task: { id: number; name: string; estimatedHours: number }) => {
    onDeferTask?.(task);
    setDeferredCount((count) => count + 1);
  };

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
        {recoveryNudge && <p className={`confirm-commitment-nudge confirm-commitment-nudge-${percentAfter > 90 ? "overload" : "tight"}`}>{recoveryNudge}</p>}
        <p className={`confirm-commitment-message confirm-commitment-message-${blocked ? "blocked" : tone}`}>{message}</p>
        <div className="confirm-commitment-breakdown">
          <div><span>Current available</span><strong>{currentAvailable.toFixed(1)} hrs</strong></div>
          <div><span>This task</span><strong>{taskDuration.toFixed(1)} hrs</strong></div>
          <div><span>After adding</span><strong>{displayPercent} of your week</strong></div>
        </div>
        {blocked && <p className="confirm-commitment-warning">This won't fit. Reschedule or defer a lower-priority task to make room:</p>}
        {blocked && deferrableTasks.length > 0 && <div className="confirm-commitment-deferrals"><span className="confirm-commitment-deferrals-label">Deferrable tasks (shortest first)</span>{deferrableTasks.map((task) => <button key={task.id} type="button" className="confirm-commitment-defer" onClick={() => deferTask(task)}><span>{task.name}</span><strong>{task.estimatedHours.toFixed(1)} hrs</strong></button>)}</div>}
        {deferredCount > 0 && <p className="confirm-commitment-deferred-count">You've deferred {deferredCount} task{deferredCount === 1 ? "" : "s"} to make room.</p>}
        <div className="confirm-commitment-actions">
          <button ref={cancelRef} type="button" className="confirm-commitment-cancel" onClick={close}>Cancel</button>
          <button type="button" className="confirm-commitment-confirm" onClick={onConfirm} disabled={blocked}>Yes, Add It</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAddCommitmentModal;
