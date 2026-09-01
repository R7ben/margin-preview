# Verification notes

The live preview loads at the generated preview URL with title “MARGIN — Recovery-first planning”. The onboarding screen renders at desktop and 375px mobile widths with the expected Recovery Floor controls, Available Capacity calculation, fixed commitments, and Start Planning action. Clicking Start Planning changes the in-memory screen state to the Portfolio Dashboard. The dashboard shows a 95.5 hrs Recovery Margin from the default sample data, daily margin dots, allocation bars, flexible commitments, and action controls. The preview environment displays a fixed Preview mode notice; this is expected for the sandbox preview and is not part of the app UI.

The dashboard’s live browser content confirms the four allocation bars, three active flexible commitments, Add Task and Recovery Planner actions, and the Quick Check floating action are visible and reachable after scrolling.

In Commitment Mirror, typing “lab report” updated the lookup to “Suggested: 3–4 hrs | High load” and auto-filled 3.5 hrs. Entering 100 hrs produced a negative projected Recovery Margin, a light-red consequence panel, sleep impact on Friday, a floor-breach message, a HIGH risk label, and a Triage callout. Expanding See options exposed Add Anyway, Split Into 2 × hours, Find a Slot, and Defer Something First without removing user agency.

Recovery Planner verification: default active tasks resolve to “Load pattern: Heavy mental” with “Physical activity recommended. No screens.” The planner displays three specific suggested blocks (Tuesday, Thursday, Sunday) and Protect actions. Protecting Tuesday produced the in-page confirmation “Recovery block locked into your week.” and the block remained a Tier 2 candidate in the UI.

Weekly Reflection verification: the view shows the exact “Recovery Maintained” label, reflection message, recovery-floor breach count, commitments rebalanced, “Add Anyway” overrides, hardest-day note, and the two requested CTAs. It does not present task-completion counts or productivity scoring.

Revision verification: onboarding still calculates 103 hrs Available Capacity. Dashboard now derives the trend reference from the current schedule: 95.5 hrs Recovery Margin is shown as shrinking from 103 hrs before flexible commitments, rather than using an unrelated hardcoded Monday value. Dashboard controls remain reachable in the preview.

Revision browser verification: entering “lab report” with a 100-hour estimate due Thursday shows a projected -4.5 hrs, “Thu sleep” with 7h → 0h, “4 consecutive high-load days ahead,” and “Recovery floor breached by 15 hrs on Thu.” The card fades to light red, the projected margin is dark red, HIGH risk is visible, and the dominant Triage action appears.

After restarting the preview server, the clean onboarding state responds normally and again shows 103 hrs Available Capacity. The preview interaction channel recovered; the earlier browser timeouts were transient.

The corrected dashboard currently derives daily margins of Mon 16h, Tue 14h, Wed 16h, Thu 10h, Fri 9.5h, Sat 14h, Sun 16h, with all seven status dots and text values visible. The dashboard trend is derived from 103 hrs available before the 7.5 hrs of active flexible tasks. Manual Triage is reachable through the dashboard actions after the Recovery Planner path is used or via the deficit callout in an overloaded state; the bottom action bar remains visible.

The breached Commitment Mirror state remains fully day-specific after the latest changes: “Thu sleep 7h → 0h”, “4 consecutive high-load days ahead”, and “Recovery floor breached by 15 hrs on Thu.” The direct “Triage becomes the clearest next option” callout is visible and reachable from this state.

Triage verification: from the breached Commitment Mirror route, the screen shows only three Tier 3 flexible commitments — Readings for seminar, Laundry, and Society discussion — with hours and push dates. It explicitly states “Recovery blocks are never suggested here.” No sleep, decompression, or recovery-block record appears in the deferrable list.

A fresh reload after the Triage check resets to onboarding with 103 hrs Available Capacity, confirming the prototype remains in-memory only. The browser preview recovered again and the clean CTA is reachable.

The clean dashboard shows the corrected trend reference and all seven daily dot values. The Quick Check floating action “Can I afford this?” is visible at the bottom-right and is separate from the Add Task action.

Quick Check verification: opening the floating action displays the read-only overlay; entering “lab report” and 4 hrs changes the preview from 95.5 hrs to 91.5 hrs while the dashboard behind it remains unchanged. Closing returns to the same 95.5 hrs dashboard with the original three active tasks. Add to Schedule routes to a blank Commitment Mirror with the estimate flow ready and does not mutate the dashboard directly.
