# Handoff — 24 June 2026

## Current phase: 1 (Bare-bones quiz engine)

**Completed (Phase 0):**
- [x] Expo SDK 56 project initialized (managed workflow, TypeScript strict)
- [x] `expo-sqlite` installed via `npx expo install`
- [x] `nativewind` + `tailwindcss` configured with design tokens
- [x] `src/db/schema.ts` — 5 tables (qualifications, topics, questions, answer_options, progress)
- [x] `src/db/migrations.ts` — PRAGMA user_version + migration runner
- [x] `src/db/seed.ts` — seedFromBundle() with typed SeedBundle format + seedContentTopic + ensureQualification
- [x] `src/db/seed-content.ts` — seeds Standard 10 (Safeguarding Adults) from JSON
- [x] `docs/questions/cc-standard-10.json` — 15 questions with explanations
- [x] `REVIEW.md` — pre-PR self-verification checklist
- [x] AGENTS.md finalized with AI prompt block, design spec, constraints
- [x] Gating decision #5 resolved: purple-warm design direction
- [x] PR #1 opened: `phase0/data-schema` (merged)
- [x] PR #2 opened: `phase0/data-schema` (merged — eslint + PR comments)

**Completed (Phase 1):**
- [x] `app/_layout.tsx` — Root layout with SQLiteProvider + DB init
- [x] `app/index.tsx` — Home screen (topic list, Start Quiz button)
- [x] `app/topic/[topicId]/index.tsx` — Quiz Session screen (progress dots, answer selection, immediate feedback, explanation reveal)
- [x] `app/topic/[topicId]/results.tsx` — Topic Results screen (score, retry, back to home)
- [x] `src/db/queries/questions.ts` — Query functions (getAllTopics, getQuestionsByTopic, getTopic)
- [x] `src/db/queries/progress.ts` — saveProgress + getProgressByTopic
- [x] `src/lib/db.ts` — Module-level DB singleton
- [x] `src/lib/DatabaseInitializer.tsx` — Runs migrations + seeds content at startup
- [x] `src/store/useQuizStore.ts` — Zustand store (flat state, verb-prefixed actions)
- [x] Dependencies: zustand, expo-router, expo-linking, expo-constants, expo-system-ui
- [x] Offline verified: zero network calls in quiz flow
- [x] Explanation-per-answer mechanic reviewed: all 15 explanations read well, display matches spec
- [x] PR #3 opened: `phase1/quiz-engine` (branch pushed, gh CLI not available — create via GitHub UI)

**Next step:** Phase 2 — Scale content + build remaining core-loop screens.

## Commands

```sh
npx tsc --noEmit          # TypeScript check (currently clean)
npx eslint . --ext .ts,.tsx  # Lint (currently clean)
npx expo test             # Tests (not yet configured — Phase 1 tradeoff)
```

## Open gating decisions

| # | Decision | Blocking phase | Status |
|---|---|---|---|
| 1 | NVQ awarding body (City & Guilds, NCFE, etc.) | Phase 2 (content track) | **UNRESOLVED** |
| 2 | Exact free-tier topic split | Phase 3 (monetisation) | **UNRESOLVED** |
| 3 | Package name (`com.<domain>.carepractice`) | Phase 5 (submission) | **UNRESOLVED** |
| 4 | Review/share prompt exact wording and placement | Phase 4 (completion screen) | **UNRESOLVED** |

## Branch

`phase1/quiz-engine` — pushed to origin. Create PR at:
https://github.com/RumenDimov/testMobileApp/pull/new/phase1/quiz-engine
