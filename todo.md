# MARGIN revision checklist

- [x] Make Commitment Mirror show a named-day sleep impact for accepted commitments.
- [x] Make Commitment Mirror show the number of consecutive high-load days.
- [x] Make Commitment Mirror show recovery-floor breach amount and named day when breached.
- [x] Audit and correct dashboard daily dot colors from actual daily load status.
- [x] Verify and correct the trend reference calculation from the current schedule before flexible commitments.
- [x] Verify Triage never presents recovery blocks as deferrable; only flexible tasks may be triaged.
- [x] Fully exercise the Quick Check overlay input, projection, close, and add-to-schedule behavior.
- [x] Polish Commitment Mirror Stage 2 / Stage 3 transitions and Recovery Margin bar shrink motion.
- [x] Run TypeScript/build checks and capture final responsive screenshots.

## Demo consistency revision

- [x] Seed a visibly loaded but usable demo week so a moderate next task surfaces recovery consequences.
- [x] Pass projected Commitment Mirror margin into Triage instead of reading the unmodified live margin.
- [x] Initialize Triage Remaining Deficit from the projected negative margin, not zero.
- [x] Calibrate dashboard day-dot colors so comfortable daily margins are green and only tight days use amber/red.
- [x] Re-run TypeScript/build checks and browser verification for the loaded-week demo and 290-hour breach scenario.
