# MARGIN Design Direction

## Three Possible Approaches

### Theme Name: Quiet Instrument
**Very Brief Intro:** A calm, precision-oriented planning instrument that treats recovery as structural infrastructure. White space, measured hierarchy, and small shifts in state make the cost of decisions legible without dramatizing them.

**Probability:** 0.07

### Theme Name: Field Notes
**Very Brief Intro:** A tactile, paper-like interface that frames the week as a set of annotated observations. Warm neutrals and handwritten cues would make the tool feel personal and reflective.

**Probability:** 0.03

### Theme Name: Signal Room
**Very Brief Intro:** A high-contrast operational console where recovery states read as clear signals across the week. Strong dark framing and restrained state color would make escalation highly visible.

**Probability:** 0.09

## Selected Approach: Quiet Instrument

### Design Movement
Calm technology / Swiss-influenced information design, interpreted through the hierarchy and restraint of Linear and Apple Health. The interface should feel like a dependable instrument, not a lifestyle product.

### Core Principles
1. Recovery is the first visual anchor; obligations are secondary context.
2. Every color change communicates a real state change and is paired with an explicit label.
3. Use generous whitespace, crisp dividers, and intentional alignment to make tradeoffs readable.
4. Preserve agency: warnings clarify consequences, but never shame or hard-lock the user.

### Color Philosophy
The prescribed four-state palette is the product language. Blue marks recovery blocks and locked infrastructure; green, amber, red, and dark red describe progressively tighter margin states. The off-white canvas and white cards keep the experience quiet while the dark blue header gives the product a steady frame.

### Layout Paradigm
A mobile-first instrument panel: one dominant metric or consequence per screen, with supporting evidence stacked beneath it. On larger screens, the main reading column stays narrow and focused while secondary information moves into a quiet side rail rather than stretching into a generic centered grid.

### Signature Elements
- A thin vertical state rail beside every major card.
- Hairline progress bars with small labels that read like instrument annotations.
- A dark-blue cap/header with a compact MARGIN wordmark and a small live week marker.

### Interaction Philosophy
Interactions should feel reversible, deliberate, and low-friction. Buttons remain usable during warnings, input suggestions appear as observations rather than prescriptions, and overlays close without changing state unless the user explicitly commits.

### Animation
Use smooth CSS transitions for state changes: 180–240ms for navigation and controls, 300–400ms for recovery margin and consequence changes, always with an ease-out curve. New content can fade and translate a few pixels into place; no motion should imply celebration. Respect reduced-motion preferences.

### Typography System
Use Inter at 400 and 600, as required by the product specification. Large metrics use semibold with tight tracking; labels remain regular and slightly letter-spaced; supporting text stays in the secondary gray. No decorative boldness and no display typeface that would compete with the data.

### Brand Essence
**MARGIN is a recovery-first decision-support instrument for university students, showing the human cost of commitments before they accept them.** Personality: measured, humane, exacting.

### Brand Voice
Headlines are concise and observational. CTAs describe an action or choice without cheerleading; microcopy explains consequences in plain language.

Example lines:
- “Before your tasks. Set your limits.”
- “This fits only if Thursday sleep gives way.”

### Wordmark & Logo
Use a compact MARGIN wordmark in the dark header with a custom margin-mark: a squared open bracket enclosing a short horizontal line, suggesting a protected boundary with capacity inside. The mark should be visible without depending on the name.

### Signature Brand Color
**Deep Ocean `#1B4965`** — the steady frame around the recovery system, distinct from the state colors and legible against the off-white canvas.

## Style Decisions

- Follow the supplied MARGIN design system exactly: Inter, four recovery states, blue recovery blocks, off-white background, white cards, and dark header.
- Keep the UI calm and observational. Avoid generic wellness language, gamification, decorative illustration, and celebratory feedback.
- Treat the Recovery Margin or the active consequence as the one dominant element on each screen.

## Style Decisions

- State colors appear only on true recovery or margin status indicators, rails, progress bars, and labeled metrics. Brand/display text stays Deep Ocean or neutral ink.
- The onboarding screen prioritizes the live Available Capacity reading and setup controls over decorative hero emphasis.
- The MARGIN vertical state rail is repeated beside major cards and decision blocks as the persistent signature motif.
