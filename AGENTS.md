# AGENTS.md

You are an expert React Native and Expo engineer helping me build the
Care Certificate & NVQ Practice App.
Write clean, simple, maintainable code. Prioritize clarity over
unnecessary abstraction.
Think like a senior mobile developer.

---

## Project Overview

We are building a mobile app helping UK care workers study for the
Care Certificate and NVQ/RQF Level 2–3 Adult Care qualifications:
short, plain-English practice quizzes built directly from official
assessment criteria, designed for 10-minute gaps between shifts.

**"Understand it. Don't just copy it."**

The app includes:
- 16 Care Certificate standards + one NVQ track, delivered as short topic-based quizzes
- Multiple-choice questions with mandatory plain-English explanations on every answer
- Free tier (several full standards, permanently free) + one-time paid unlock (£2.99–£4.99, no subscription)
- Mock exam mode (timed, mixed-topic) as part of the paid unlock
- Local progress tracking (topic scores, completion flags) — no accounts, no backend
- Review/share prompt triggered at topic or qualification completion
- Offline-first: entire core loop works in airplane mode
- Basic settings (disclaimer, restore purchase, feedback link)

Keep the implementation simple and readable.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54+ (managed workflow) |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based routing) |
| Styling | NativeWind (Tailwind classes) |
| State | Zustand |
| Persistence | AsyncStorage (flags/prefs) + Expo SQLite (content + progress) |
| Content delivery | SQLite seed on first launch; updatable via EAS Update |
| Payments | Google Play Billing via `react-native-iap` |
| Analytics | PostHog (free tier, scoped events only) |
| Build/deploy | EAS Build, EAS Submit, EAS Update |

---

## Hard Constraints (do not break these)

### Strategic
- **No subscriptions, ever.** One-time purchase only (£2.99–£4.99). This is non-negotiable — it is the product's core differentiator.
- **No accounts / no auth.** No login, no registration, no backend. Progress is local-only. Product Brief explicitly rules this out.
- **No backend / no server.** All content lives in local SQLite seeded on first launch. No uptime risk, no hosting costs.
- **This is a study aid, not a cheat tool.** Every answer must carry a plain-English explanation. Never ship bare correct/incorrect toggles without explanation text. The app must frame itself as practice material, never "answers to copy."
- **Free tier must be genuinely useful.** Several full Care Certificate standards stay free, permanently. This protects word-of-mouth reach — the paywall must not feel tight.
- **Offline-first core loop.** Quiz-taking, scoring, progress — the entire core loop works in airplane mode. The only feature requiring connectivity is Google Play Billing purchase/restore.

### Technical
- **Expo managed workflow only.** No bare workflow, no ejecting.
- **Strict TypeScript.** No `any` without an explicit `// eslint-disable-next-line` justification. No implicit `any` from untyped callbacks.
- **No Redux.** Zustand is the only state management library. If you reach for Redux, stop and reconsider the data flow.
- **No server round-trips for content.** Content is shipped in the APK/IPA and seeded into SQLite on first launch. EAS Update patches content OTA — never add a network fetch for quiz data.
- **Expo Router file-based routing only.** `app/` folder structure is the navigation. No manual React Navigation wiring.
- **NativeWind for all styling.** Tailwind class strings only. No `StyleSheet.create()`, no inline style objects, no third CSS-in-JS solution in parallel.
- **Install via `npx expo install <pkg>` only.** Never raw `npm install` for any Expo-compatible package — Expo's auto-resolve prevents SDK version mismatches.

---

## Code Style Rules (strict)

### General
- Single export per file unless it is a barrel (`index.ts`) re-exporting siblings.
- Files must not exceed 300 lines. If a file approaches 250 lines, split it.
- Functions must not exceed 50 lines. If a function approaches 40 lines, extract helpers.
- No default exports in component files. Use named exports only. Barrel files may use `export { default as X }` re-exports.
- No comments that describe *what* code does — the code already says that. Comments are for *why* something surprising or non-obvious exists. The one exception: doc-comments on exported functions/types that form a public API surface (JSDoc-style `@param`, `@returns`).

### TypeScript
- All function return types must be explicit. No inferred return types on exported functions.
- Prefer `type` aliases over `interface` for data shapes. Reserve `interface` only where declaration merging is genuinely needed.
- Enums are banned. Use string literal unions instead.
- `null` and `undefined` are distinct. Never use `null` as a general-purpose empty value. Use `undefined` for "not present," `null` only for "explicitly set to nothing" (e.g. a database field that supports NULL).

### Components
- One React component per file. Co-located private helpers in the same file are acceptable if under 15 lines each.
- Components use `function` declarations, not arrow functions assigned to `const`.
- Props type is always named `Props` and defined in the same file above the component.
- No inline callbacks longer than 3 lines in JSX — extract to named `handle*` functions before the `return`.
- Never call hooks conditionally. Extract the conditional logic into the hook or into a child component.

### State (Zustand)
- Store files live in a single folder, one store per file, named `use<Thing>Store.ts`.
- Store state is flat by default. Nest only when truly hierarchical data requires it, and document why.
- Actions that trigger side effects (persistence calls, navigation) must be named with a verb prefix: `load`, `reset`, `mark`, `purchase`, etc. Pure state updaters may be bare setters.
- Never destructure store values in the same statement as calling a hook — it triggers unnecessary re-renders. Use selectors.

### SQLite
- All SQL is in a single `src/db/` folder: `schema.ts` (CREATE TABLE statements), `seed.ts` (initial data insertion), `migrations.ts` (schema/content version checks).
- Never embed raw SQL in components or hooks. Every query lives in a named exported function in `src/db/queries/`.
- Read queries return plain objects, not database cursors. The caller never sees a row reference.
- The `progress` table is the only table written to at runtime. `qualifications`, `topics`, `questions`, `answer_options` are read-only after seeding (unless a content update reseeds them — see `migrations.ts`).

### Testing
- Every `src/db/queries/` function must have a corresponding `*.test.ts` file.
- Every Zustand store must have a `*.test.ts` file covering actions and derived state.
- Screen components are tested with `@testing-library/react-native` for user-facing interactions. At minimum: renders without crash, key user paths (tap to start quiz, answer question, view result).
- Run tests with `npx expo test` (Jest with Expo preset).

### Git
- Branch naming: `phase<N>/<short-description>` (e.g. `phase0/data-schema`, `phase3/paywall`).
- Commit messages are imperative and short: `<area>: <verb> <what>` (e.g. `db: add progress table`, `quiz: wire answer feedback`).
- Never commit generated build artifacts, `.expo/`, or `dist/` folders.

---

## Architecture (source of truth: Technical Specification)

### Data Schema (SQLite, five tables)

- **qualifications** — top-level tracks (Care Certificate, NVQ L2/3)
- **topics** — one row per Care Certificate standard or NVQ unit; `is_free` column gates the paywall
- **questions** — quiz questions built from official assessment criteria; `source_criterion` kept for traceability; `explanation` is mandatory
- **answer_options** — multiple-choice rows; exactly one `is_correct = 1` per question
- **progress** — the only runtime-writeable table; one row per topic attempt (`score_correct`, `score_total`, `is_mock_exam`, `attempted_at`)

### Navigation Map
```
Onboarding (first launch) → Home
Home → Quiz Session (free topic)
Home → Paywall (locked topic or Mock Exam)
Quiz Session → Topic Results (after last question)
Topic Results → Completion screen (first-time full completion) | Home (retry/close)
Completion → Home
Paywall → Purchase Confirmation (success) | Home (dismiss)
Settings → Restore Purchase → Confirmation or back
```

### Offline Rules
- Core loop (browse → quiz → score) must work with zero network. Test in airplane mode.
- EAS Update checks run silently on launch when online; skip silently when offline. Never block app load on this check.
- Paywall must detect no-connectivity and show a clear message — do not let purchase fail silently.

---

## Build Sequence (must follow this order)

### Phase 0 — Data model + one real topic
**Goal:** Prove the schema holds up against actual content. The cheapest point to change it.

**Deliverables:**
- Full SQLite schema (`schema.ts`) with all five tables
- Seed script (`seed.ts`) that loads from a JSON content file
- One complete Care Certificate standard (Standard 10: Safeguarding) run through the content pipeline and loaded as seed data
- Schema versioning (`PRAGMA user_version`) wired in `migrations.ts`

**Exit gate:** Can the schema cleanly represent an entire standard's worth of real questions and explanations without hacks or workarounds? If not, fix the schema here — not later.

### Phase 1 — Bare-bones quiz engine (one topic, ugly UI)
**Goal:** Prove the core loop works end to end, before visual polish.

**Deliverables:**
- Quiz Session screen (question render, answer selection, immediate feedback, explanation reveal) — default unstyled components only
- Topic Results screen (score, retry, back-to-home)
- Progress writes on quiz completion
- Verified offline behaviour (airplane mode: quiz still runs, score still saves)

**Exit gate:** Can you open the app, tap the topic, answer every question, see explanations after each, view your score, retry, and close — all with no network?

### Phase 2 — Scale content, build remaining core-loop screens
**Two parallel tracks:**

*Content track:* Run the remaining 15 Care Certificate standards AND the chosen NVQ track through the production pipeline. Seed all into the DB.

*Build track:*
- Home / Topic List screen (browse standards, free-vs-locked indicator, per-topic progress glance)
- Mock Exam Mode screen (timed, mixed-topic question draw from paid-tier topics)

**Exit gate:** All 16 Care Certificate standards + NVQ track loaded. Home, Quiz, Results, Mock Exam all functional. One full mock exam can be taken.

### Phase 3 — Monetisation
**Goal:** Integrate Play Store billing last, after the core product is proven.

**Deliverables:**
- Paywall screen (one-time price displayed, explicit "no subscription" framing)
- Purchase Confirmation screen
- Restore Purchase flow (accessible from Paywall and Settings)
- Full purchase → unlock → restore-on-reinstall cycle verified in Play Console sandbox

**GATE — Product decision required before this phase starts:**
- Which exact Care Certificate standards are free? (Must be a meaningful slice — several full standards, not fragments.)

### Phase 4 — Retention screens & polish
**Goal:** Build the word-of-mouth engine and apply consistent visual design.

**Deliverables:**
- Topic/Qualification Complete screen (review prompt + share action, shown once per milestone, not after every quiz)
- Progress/Stats screen (per-topic read from `progress` table, best score, completion flags)
- Onboarding screen (first launch only: what this app is, free-vs-paid in one screen, no account step)
- Settings/About screen (disclaimer text, restore purchases, feedback link, version info)
- Consistent NativeWind styling applied across all screens
- PostHog events wired at the identified tracking points

### Phase 5 — Pre-launch QA & submission
**Deliverables:**
- Manual first upload to Google Play Console
- Internal testing track (include a frontline-experience reviewer)
- EAS Update verified for at least one trivial OTA content change (proves the "fix wrong answer same-day" capability)
- Production submission via EAS Submit

**Exit gate:** App live on Play Store. Rating target: >4.0 with ≥20 reviews in first 90 days.

---

## Gating Decisions (resolve before the named phase starts)

| # | Decision | Blocking phase | Current status |
|---|---|---|---|
| 1 | Which NVQ awarding body? (City & Guilds, NCFE, etc.) | Phase 2 (content track) | **UNRESOLVED** |
| 2 | Exact free-tier topic split (which Care Certificate standards are free) | Phase 3 (monetisation) | **UNRESOLVED** |
| 3 | Package name (`com.<domain>.carepractice`) | Phase 5 (submission) | **UNRESOLVED** |
| 4 | Review/share prompt exact wording and placement | Phase 4 (completion screen) | **UNRESOLVED** |
| 5 | App icon, splash screen, and visual design direction | Phase 4 (polish) | **RESOLVED** — purple-warm, see Design Spec below |

---

## Design Spec

**Status: DIRECTION AGREED — purple-warm.** Details below are working decisions; adjust as screens are built.

Reference images in `docs/designs/` are starting points only. The spec below is the source of truth.

### Design direction

**Purple-warm.** Purple conveys learning, thoughtfulness, and calm confidence — without the corporate coldness of blue or the clinical sterility of pure white. Warm undertones keep it encouraging, not academic. The audience is care workers, not exam boards.

### Color palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#7C3AED` | Brand, CTAs, selected states, progress fill |
| Primary light | `#EDE9FE` | Selected answer background, progress track, subtle highlights |
| Surface | `#FFFFFF` | Cards, modals, elevated content |
| Background | `#FDFBFE` | Screen background — warm off-white, never stark #FFF |
| Text primary | `#1E1B1E` | Body text, question prompts — near-black with warm undertone |
| Text secondary | `#6B6570` | Supporting text, topic summaries, metadata |
| Correct | `#16A34A` | Correct answer indicator, score positive |
| Incorrect | `#DC4C4C` | Incorrect answer indicator — warm red, not harsh |
| Free tier | `#7C3AED` | "Free" badge/label on topic cards |
| Locked | `#9E9CA6` | "Locked" indicator on topic cards |
| Divider | `#E8E5EC` | Subtle separators between cards and sections |

All combinations meet WCAG AA contrast minimum (4.5:1 for body text, 3:1 for large text).

### Typography

Use system fonts only — no custom font loading. This keeps the app light and avoids rendering delays on cheap devices.

| Token | Size / Line-height | Weight | Usage |
|---|---|---|---|
| Display | 28px / 36px | Bold (700) | Qualification complete screen heading |
| Title | 22px / 30px | Semibold (600) | Screen titles, topic names |
| Heading | 18px / 26px | Semibold (600) | Question prompt, section headers |
| Body | 16px / 24px | Regular (400) | Answer text, explanations, body copy |
| Caption | 14px / 20px | Regular (400) | Metadata, progress labels, source criterion references |
| Button | 16px / 24px | Semibold (600) | All tappable CTAs |

Rules:
- Minimum body size is 16px — never smaller for user-facing content.
- Line-height is always ≥1.5 for body text (ESL readability).
- No all-caps labels. Use sentence case everywhere.
- No justified text. Left-aligned only.

### Spacing

4px base unit. All spacing uses multiples of 4.

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Icon-to-label gaps |
| sm | 8px | Tight internal padding |
| md | 16px | Standard padding, card padding |
| lg | 24px | Screen horizontal padding, section gaps |
| xl | 32px | Major section separation |

Cards have minimum 16px internal padding. Touch targets are minimum 48px in both dimensions.

### Component patterns

**Answer cards:** Full-width, white surface, 16px padding, rounded-xl (12px). Selected state: primary-light background (`#EDE9FE`) with primary left border (4px). Correct reveal: green left border + check icon. Incorrect reveal: red left border + x icon.

**Explanation panel:** Appears immediately below the answer card after selection — never hidden behind a tap-to-expand. Full-width, 16px padding, background `#F5F3FA` (subtle purple tint to distinguish from answer card). Body text styling. Always visible.

**Progress indicator:** Top of quiz screen. Row of dots (current question filled primary, completed filled with opacity, upcoming outline). Simple, glanceable. No percentages during the quiz — those live on Results.

**Topic cards (Home screen):** White surface, rounded-xl, subtle shadow (NativeWind `shadow-sm`). Title + short summary. Free/locked badge in top-right. If topic has prior attempts: show best score as a small `Score best: 7/10` caption.

**CTA buttons:** Full-width, 52px height, primary background, white text, rounded-lg. Secondary buttons (Retry, Back to Home): outline style with primary border + primary text on transparent background.

**Paywall card:** Prominent white card with "One-time purchase. No subscription. Ever." as the hero message. Price in Display size. "Unlock full access" CTA. Small caption: "Pay once, keep forever."

### Mode

Light mode only for v1. The audience studies in short gaps on phone screens, often in brightly lit break rooms or on buses. Dark mode adds engineering cost without a clear user need at launch. Revisit if user feedback requests it.

### Icon & splash

- **App icon:** Rounded square, primary purple (`#7C3AED`) background, a simple white icon — open book or graduation cap in a warm, rounded style. No text on the icon.
- **Splash screen:** Primary purple background with white app icon centered. Fades into the app's first screen (Onboarding or Home). Keep under 1 second.

---

## Key Product Principles (shape every implementation decision)

1. **The explanation is the product.** A quiz question without a plain-English explanation is not finished. This is what users will credit in reviews and what makes the app worth recommending. Never ship a screen that hides or buries explanations.

2. **Honesty is the strategy.** "No subscription, pay once, no surprises" is not just ethical — it is the competitive moat against an entire category of exam-prep apps whose billing practices drive their 1-star reviews. Every monetisation interaction must reinforce this message.

3. **Build for Blessing first.** The primary persona is a care worker with ESL, studying on phone screens in 10-minute gaps. If a feature or design works for a native-English desktop user but confuses Blessing, it is wrong.

4. **Word of mouth is the only growth channel.** There is no marketing budget. Every screen must ask: "Would a satisfied user share this moment with a colleague?" The Completion screen is the single most important marketing surface in the app.

5. **Content correctness is existential.** A single factually-wrong question generates the same complaint that plagues competitor reviews. Every question must be traceable back to its source criterion (`source_criterion` column). A user-facing "flag this question" mechanism must exist.

6. **One-shot usage is the business model.** Users need this for 6–12 weeks, then leave. There is no retention loop. Do not design features that assume returning users. Do not sacrifice first-session experience for long-term engagement.

7. **Content updates must reach users same-day.** EAS Update + the re-seed logic in `migrations.ts` is not optional polish — it is the risk mitigation for wrong answers (Product Brief §9). If this pipeline breaks, the product's main risk is unmitigated.

---

## Companion Documents

| Document | File | Role |
|---|---|---|
| Product Brief | `docs/Project summary.docx` | Why this exists, who it's for, business model, risks, growth strategy |
| Technical Specification | `docs/Technical Specification.docx` | Stack choices, schema DDL, project structure, navigation map, analytics events |
| Screens & Build Sequence | `docs/Screens and Build Sequence.docx` | Screen list, phase-by-phase deliverables, build rationale |

**Precedence:** If two documents conflict on a technical detail, the Technical Specification wins. If they conflict on a product scope decision, the Product Brief wins. This AGENTS.md is derived from all three and is the working reference — flag any inconsistency you spot.

---

## Quick Reference: Do / Do Not

| Do | Do not |
|---|---|
| Install packages with `npx expo install` | `npm install` or `yarn add` directly |
| Ship explanations with every answer | Ship bare correct/incorrect toggles |
| Test offline: airplane mode, quiz still works | Assume network is available |
| Use `src/db/queries/` for all SQL access | Embed SQL in components or hooks |
| Use `npx expo test` for test runs | Use bare Jest without Expo preset |
| Seed content from JSON; update via EAS Update | Fetch quiz data over the network |
| Keep files under 300 lines, functions under 50 | Let files and functions grow unbounded |
| Use `type` over `interface`, string unions over enums | Add new `enum` or default to `interface` |
| Follow the build sequence phase order | Skip to Phase 3 (monetisation) before Phase 0 is proven |
| Make progress local-only, no sync | Add a user account system or a sync API |
