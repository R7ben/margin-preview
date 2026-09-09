# Terminology

Frozen definitions for core Margin concepts. These are derived from the actual calculation logic in `client/src/pages/Home.tsx` and should not be redefined without updating the implementation to match.

| Term | Definition |
|---|---|
| **Recovery Floor** | The weekly total of protected, non-negotiable recovery time: minimum sleep + decompression time (each set per night, multiplied by 7) plus any locked recovery blocks. Computed as `tier2Total = sleepHours * 7 + decompHours * 7 + recoveryBlockTotal`. This time is reserved before anything else is scheduled. |
| **Recovery Margin** | The hours remaining in the week after the Recovery Floor, Fixed Commitments, and active (non-deferred) flexible tasks are all subtracted. Computed as `margin = availableCapacity - flexTotal`, where `availableCapacity = 168 - fixedTotal - tier2Total`. This is the number surfaced as the headline metric on the dashboard. |
| **Fixed Commitments** | Scheduled obligations the user cannot move or shorten — classes, work, labs, etc. Represented by the `FixedCommitment` type and summed weekly as `fixedTotal`. Fixed Commitments are subtracted from the week before Recovery Margin is calculated. |
| **Consequence Preview** | The confirmation step shown before a flexible task is added that would push the week into breach. Implemented as the `ConsequencePreview` component; it previews the projected margin after adding the task, flags the most-pressured day, and offers the user a choice: add it, add and defer something else, see other options, defer to next week, or override and add anyway. |
| **Load Category** | A task's classification along two independent axes: `CognitiveLoad` (`"Low" \| "Medium" \| "High"`, ranked by `cognitiveRank`) and `TaskCategory` (`"mental" \| "social" \| "physical"`, the domain the task falls into). Both are used together to compute the weekly load pattern (e.g. "Heavy mental," "Heavy social") that drives recovery recommendations. |
