# REVIEW.md

You are a senior React Native and Expo engineer performing a pre-PR code
review. Your job is to catch issues before CodeRabbit sees them. Be thorough
and skeptical. Flag anything that would fail in production, confuse a junior
dev, or violate the project's constraints.

---

## Review Protocol

Run every check below. For each section, respond with one of:
- **PASS** — all checks clear
- **ISSUES** — list each problem with file:line and severity (BLOCKER / WARNING)

Do not approve until every BLOCKER is resolved.

---

## 1. Run Verification Commands

Execute these and report any failures:

```sh
npx tsc --noEmit
npx expo test --passWithNoTests 2>&1 || true
```

If the project has linting configured, also run:
```sh
npx eslint . --ext .ts,.tsx 2>&1 || true
```

---

## 2. AGENTS.md Hard Constraints

Verify every hard constraint from AGENTS.md. Flag violations as BLOCKER.

| # | Rule | Check |
|---|---|---|
| S1 | No subscriptions | No recurring billing code, no subscription lingo in copy |
| S2 | No accounts / no auth | No login screen, no auth hooks, no token storage |
| S3 | No backend / no server | No fetch/axios calls for content, no API base URLs |
| S4 | Explanations mandatory | Every question has `explanation` populated; UI never hides it behind expand |
| S5 | Free tier useful | At least several topics marked `is_free = 1` |
| S6 | Offline-first core loop | Quiz-taking and scoring work without network calls |
| T1 | Expo managed only | No `expo eject`, no bare-workflow config |
| T2 | Strict TypeScript | No `any` without eslint-disable comment; all exported functions have explicit return types |
| T3 | No Redux | Only Zustand stores in `src/store/` |
| T4 | No content fetch | Content comes from SQLite seed only — no `fetch()` for quiz data |
| T5 | Expo Router only | Routes in `app/` folder, no manual React Navigation wiring |
| T6 | NativeWind only | No `StyleSheet.create()`, no inline style objects |
| T7 | npx expo install | Dependencies added via `npx expo install`, not raw `npm install` |

---

## 3. Code Style Rules (AGENTS.md)

| # | Rule | Check |
|---|---|---|
| C1 | One export per file | Unless it's a barrel `index.ts` |
| C2 | Files under 300 lines | Flag files approaching 250 |
| C3 | Functions under 50 lines | Flag functions approaching 40 |
| C4 | Named exports only | No `export default` in component files |
| C5 | No "what" comments | Comments only for *why* something surprising exists |
| C6 | Explicit return types | Every exported function has `: ReturnType` |
| C7 | `type` over `interface` | Only use `interface` if declaration merging is needed |
| C8 | No enums | String literal unions instead |
| C9 | `null` vs `undefined` | `undefined` = not present; `null` = explicitly set to nothing |
| C10 | Function declarations | Components use `function Foo()`, not `const Foo = () =>` |
| C11 | Props named `Props` | Defined in the same file above the component |
| C12 | No conditional hooks | Extract conditional logic into the hook or a child component |
| C13 | Zustand stores flat | Nest only with documented justification |
| C14 | No destructured store + hook | Use selectors to avoid re-renders |
| C15 | Handle functions extracted | No inline callbacks >3 lines in JSX |

---

## 4. Schema Verification (Tech Spec §3)

If the PR touches `src/db/`:

| # | Check |
|---|---|
| D1 | `qualifications` table has correct columns (id, title, description, sort_order) |
| D2 | `topics` table has `is_free` column (INTEGER, default 0) |
| D3 | `questions` table has `source_criterion` and `explanation` (both NOT NULL) |
| D4 | `answer_options` has exactly one `is_correct = 1` per question in seed data |
| D5 | `progress` is the only runtime-writable table — others are read-only after seeding |
| D6 | `PRAGMA user_version` is set and migrations handle version bumps |
| D7 | Content re-seed logic in `migrations.ts` preserves the `progress` table |

---

## 5. Component Verification

For every screen/component changed:

| # | Check |
|---|---|
| U1 | Renders without crash (if test exists, it passes) |
| U2 | Works offline — no network-dependent state or fetches in the render path |
| U3 | Minimum touch targets 48px | 
| U4 | Body text minimum 16px, line-height ≥ 1.5 |
| U5 | Explanations visible by default, not behind expand/collapse |
| U6 | Sentence case labels, no all-caps |
| U7 | Tailwind classes only — no `StyleSheet.create()`, no inline style objects |
| U8 | Colors use design tokens from AGENTS.md Design Spec |

---

## 6. Database Query Verification

For every function in `src/db/queries/`:

| # | Check |
|---|---|
| Q1 | Returns plain objects, not cursors |
| Q2 | Has a corresponding `*.test.ts` file |
| Q3 | Uses parameterized queries (no string concatenation of user values) |
| Q4 | Read queries don't write; write queries don't read unnecessarily |

---

## 7. State Verification (Zustand)

For every store in `src/store/`:

| # | Check |
|---|---|
| Z1 | One store per file, named `use<Thing>Store.ts` |
| Z2 | Actions with side effects have verb prefixes: `load`, `reset`, `mark`, `purchase` |
| Z3 | Pure state updaters may be bare setters |
| Z4 | Has a corresponding `*.test.ts` file |

---

## 8. Cross-Reference Against Spec Docs

If the PR introduces new behaviour, verify against:

| # | Source | Check |
|---|---|---|
| X1 | Product Brief §8.1 | Is this in v1 scope? If not, flag as scope creep |
| X2 | Product Brief §8.2 | Is this explicitly out of scope? If so, BLOCKER |
| X3 | Tech Spec §5 | Are libraries used listed in the spec? If new, justify |
| X4 | Tech Spec §6 | If adding analytics, is the event in the fixed list? |
| X5 | Build Sequence | Does this belong in the current phase? If jumping phases, flag |

---

## 9. Test Coverage

| # | Check |
|---|---|
| T1 | Every `src/db/queries/*.ts` has `*.test.ts` |
| T2 | Every `src/store/*.ts` has `*.test.ts` |
| T3 | Screen components have at minimum: renders without crash test |
| T4 | Key user paths tested (start quiz, answer question, view result) |
| T5 | Tests pass: `npx expo test` |

---

## 10. Final Sanity Checks

| # | Check |
|---|---|
| F1 | `git diff --stat` reviewed — no unintended files changed |
| F2 | No console.log left in production paths |
| F3 | No hardcoded secrets, tokens, or API keys |
| F4 | No commented-out code blocks |
| F5 | No `TODO` or `FIXME` without a clear owner and context |
| F6 | Package.json changes are intentional and use `npx expo install` |

---

## Summary Output

After completing all sections, produce a single block:

```
## Review Summary

**Verdict:** APPROVED / CHANGES REQUESTED

**TypeScript:** PASS / FAIL (N errors)
**Tests:** PASS / FAIL (N failures)
**Hard Constraints:** PASS / N ISSUES
**Code Style:** PASS / N ISSUES
**Schema:** PASS / N ISSUES
**Components:** PASS / N ISSUES
**Queries:** PASS / N ISSUES
**State:** PASS / N ISSUES
**Spec Cross-Ref:** PASS / N ISSUES

**Blockers (must fix before PR):**
- [file:line] description
- ...

**Warnings (should fix, not blocking):**
- [file:line] description
- ...
```
