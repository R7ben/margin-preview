# Non-Goals

Explicit scope boundaries for the current phase of Margin.

- **No working backend logic in this phase.** All state (fixed commitments, tasks, recovery blocks, check-ins) lives in client-side React state. There is no persistence, sync, or server-side calculation.
- **No gamification or streak mechanics.** Explicitly rejected — Margin is not designed to reward consistency with streaks, points, or badges.
- **Adoption paradox (known limitation, not solved in this phase).** Margin's capacity model depends on consistent student logging. The most overloaded students are least likely to log consistently, which can cause the model to go stale exactly when it matters most. We've scoped this as a known limitation rather than solving it now — a future version could infer load passively from calendar/task-completion patterns rather than requiring active logging.
