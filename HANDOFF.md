# Handoff — 23 June 2026

## Current phase: 0 (Data model)

**Completed:**
- [x] Expo SDK 56 project initialized (managed workflow, TypeScript strict)
- [x] `expo-sqlite` installed via `npx expo install`
- [x] `nativewind` + `tailwindcss` configured with design tokens
- [x] `src/db/schema.ts` — 5 tables (qualifications, topics, questions, answer_options, progress)
- [x] `src/db/migrations.ts` — PRAGMA user_version + migration runner
- [x] `src/db/seed.ts` — seedFromBundle() with typed SeedBundle format
- [x] `REVIEW.md` — pre-PR self-verification checklist
- [x] AGENTS.md finalized with AI prompt block, design spec, constraints
- [x] Gating decision #5 resolved: purple-warm design direction
- [x] PR #1 opened: `phase0/data-schema`

**Next step:** Phase 0 step 2 — Run Care Certificate Standard 10 (Safeguarding) through the content pipeline and load as seed data.

## Key decisions made this session

| Decision | Resolution |
|---|---|
| Design direction | Purple-warm (#7C3AED primary, warm off-white bg, system fonts, light mode only) |
| AGENTS.md structure | AI system prompt block at top → Project Overview → Tech Stack → Constraints |
| Code review process | REVIEW.md runs before PR; CodeRabbit runs on PR |
| Branch naming | `phase0/data-schema` confirmed |

## Commands

```sh
npx tsc --noEmit          # TypeScript check (currently clean)
npx expo test             # Tests (not yet configured)
```

## Open gating decisions

| # | Decision | Status |
|---|---|---|
| 1 | NVQ awarding body | UNRESOLVED |
| 2 | Free-tier topic split | UNRESOLVED |
| 3 | Package name | UNRESOLVED |
| 4 | Review/share prompt wording | UNRESOLVED |

## Branch

`phase0/data-schema` — PR open at github.com/RumenDimov/testMobileApp
