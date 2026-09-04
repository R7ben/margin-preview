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

The revised onboarding remains intentionally recovery-first: it shows 103 hrs available before flexible commitments. The loaded demo task set is introduced when Start Planning enters Dashboard, preserving the setup calculation while making the next-commitment demo meaningfully loaded.

Loaded-demo dashboard validation: entering Dashboard now shows 6 active tasks, 86 hrs weekly Recovery Margin, Thu at 0.5h, and status dots calibrated as Mon green, Tue green, Wed green, Thu red, Fri amber, Sat green, Sun green. This makes the Thursday recovery consequence visible before adding a new task while keeping the rest of the week comfortable.

The loaded dashboard exposes six active flexible commitments, including four mental-load tasks due Thursday totalling 13.5 hrs. A moderate new task can now be tested against this concentrated Thursday load; Add Task is reachable at the dashboard action row.

Commitment Mirror demo validation: with the loaded Thursday week, a 4-hour “lab report” shows “Thu sleep 7h → 6.5h” even though weekly margin remains comfortable at 82 hrs. The 290-hour version shows -204 hrs after accepting, “Thu sleep 7h → 0h,” 4 consecutive high-load days, and a 72-hour Thursday recovery-floor breach. The Stage 2 Triage callout is visible.

Triage propagation validation: opening Triage directly from the 290-hour Commitment Mirror scenario now shows Recovery Margin -204 hrs and Remaining Deficit 204 hrs before any selection. The list contains only flexible task buttons; the explicit note says recovery blocks are never suggested here.

The Recovery Floor Setup now exposes Import Schedule beside Add Commitment, with the existing 103 hrs setup calculation unchanged.

Import Schedule verification: the new screen shows Upload university timetable, Import calendar labelled Future build, a sample timetable preview option, manual-entry fallback, and the explicit parsing/OAuth feasibility note. The flow is visually consistent with the existing Soft Minimalism instrument language.

Import Schedule confirmation validation: selecting the sample timetable and continuing shows extracted classes Design studio (Mon/Wed, 09:00–11:00, 4h) and Statistics lab (Thu, 14:00–16:00, 2h) with an explicit Approve Fixed Load action.

Approval validation: the imported Design studio and Statistics lab are appended to Fixed commitments and Available Capacity updates from 103 hrs to 97 hrs, confirming the flow has a visible state-changing approval step.

After approving the sample timetable, Recovery Floor Setup shows both imported classes and the recalculated 97 hrs Available Capacity. The new flow returns to the existing setup screen rather than implying automatic calendar sync.

New-feature verification: the dashboard now presents as Today, and the loaded demo remains visible with six active flex tasks. The Add Task action is reachable at the bottom of Today for the pre-confirmation Consequence Preview test.

Consequence Preview setup validation: a 290-hour task on the loaded week surfaces Thu sleep 7h → 0h, 4 consecutive high-load days, and a 74-hour Thu recovery-floor breach before confirmation. The detailed state remains visible above the action area.

Consequence Preview verification: selecting Add Anyway opens a modal with projected margin, pressure-point day, See impact, Add anyway, and Reschedule actions. Confirming Add anyway returns to Today with the task added, Breached status, -210 hrs margin, and the recovery deficit callout.

Final visual verification: desktop onboarding cleanly exposes Import Schedule beside Add Commitment; mobile 375px keeps the new entry point, capacity card, and Start Planning CTA readable and usable. Weekly Reflection shows the Week 37 Ignition hook, and the overloaded Commitment Mirror flow shows the Consequence Preview modal before confirmation.
