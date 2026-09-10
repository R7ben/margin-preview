# MARGIN feature implementation checklist

## Frozen feature decisions

- [x] Polish the Today screen as the hero experience and rename all Daily Cockpit references to Today.
- [x] Add Consequence Preview as a pre-confirmation modal when a task addition triggers Triage; keep Add Anyway available and log the override in Weekly Reflection.
- [x] Add the Import Fixed Commitments screen with timetable upload option, calendar marked Future build, confirmation preview, and manual-entry fallback.
- [x] Add Weekly Ignition Hook at the end of Weekly Reflection with static Week 37 forward-motion copy.
- [x] Add Recovery Quality Self-Report only after the three core features are complete and without compromising the core flow.
- [x] Do not add Momentum/streaks, points, leaderboards, or a First-Launch Overlay.
- [x] Add docs/terminology.md with the frozen terminology table.
- [x] Add docs/non_goals.md with the exact frozen non-goals list.
- [x] Verify responsive rendering, interactions, terminology, and production build.

## Integration and verification expansion

- [ ] Add real timetable parsing for supported PDF, CSV, and image inputs with honest parse-error handling.
- [ ] Add calendar OAuth integration scaffolding and a clear disabled/unconfigured state when credentials are absent.
- [ ] Add automated regression tests for Consequence Preview and Import Schedule approval.
- [ ] Add expandable per-day load details behind Today’s margin dots.
- [ ] Run integration, regression, responsive, and production checks.







## Gemini model migration

- [ ] Find all gemini-2.0-flash references in the active request path.
- [ ] Replace them with gemini-3.6-flash.
- [ ] Run typecheck and production build.
- [ ] Push and verify the refreshed deployment and QuickCheck behavior.
