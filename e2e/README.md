# End-to-End Testing Suite

This directory contains the complete E2E testing strategy for CarePractice.

## Architecture

Two test layers provide complementary coverage:

| Layer | Tool | Location | What it tests |
|---|---|---|---|
| **E2E (on-device)** | [Maestro](https://maestro.mobile.dev) | `e2e/flows/` | Real app binary on emulator/device — user journeys, navigation, paywall, quiz flow |
| **Integration (JSDOM)** | React Native Testing Library + Jest | `app/__tests__/` | Screen components with mocked dependencies — rendering, interactions, edge cases, state transitions |
| **Unit** | Jest | `src/store/*.test.ts`, `src/db/queries/*.test.ts` | Zustand stores, DB queries — pure logic, data transformations |

## Maestro E2E Tests

### Prerequisites

- Java 11+
- Android emulator or connected device with USB debugging
- Maestro CLI installed (`./e2e/scripts/setup-maestro.sh`)

### Quick Start

```bash
# 1. Install Maestro (one-time)
bash e2e/scripts/setup-maestro.sh

# 2. Build and install the app, then run all tests
bash e2e/scripts/run-e2e.sh

# 3. Run a specific flow
bash e2e/scripts/run-e2e.sh onboarding
bash e2e/scripts/run-e2e.sh navigation
bash e2e/scripts/run-e2e.sh quiz-complete
```

### Available Flows

| Flow | Description |
|---|---|
| `onboarding.yaml` | First-launch onboarding screen renders and completes |
| `home.yaml` | Topic list rendering, free/locked badges, navigation links |
| `free-quiz.yaml` | Answer a few questions in a free quiz, verify feedback |
| `quiz-complete.yaml` | Complete an entire quiz, verify results and completion screens |
| `paywall.yaml` | Locked topic → paywall screen, feature list, dismiss |
| `navigation.yaml` | Cross-screen navigation: Home → Settings → Progress → Quiz → Paywall |
| `settings.yaml` | Settings screen: restore purchase, feedback, disclaimer, version |
| `progress.yaml` | Empty progress state, navigation |
| `edge-cases.yaml` | Empty states, back-button during onboarding |
| `completion.yaml` | Completion screen after first-time quiz pass |

### Writing New Flows

Maestro uses YAML syntax. Key commands:

```yaml
# Tap by text
- tapOn: "Start Quiz"

# Tap by testID
- tapOn:
    id: "check-answer-button"

# Assert element visible
- assertVisible: "Topic Complete"

# Scroll to find an element
- scrollUntilVisible:
    element:
      text: "Unlock to Start"
    direction: DOWN

# Wait for animations
- waitForAnimationToEnd

# Run subflow
- runFlow:
    file: subflows/answer-question.yaml

# Navigate back
- pressKey: back
```

### Test IDs Reference

Key `testID` props added to screens for reliable Maestro selectors:

| testID | Screen |
|---|---|
| `onboarding-screen` | Onboarding |
| `get-started-button` | Onboarding CTA |
| `home-screen` | Home |
| `nav-progress` | Home → Progress link |
| `nav-settings` | Home → Settings link |
| `mock-exam-card` | Home → Mock Exam card |
| `quiz-screen` | Quiz session |
| `quiz-scroll` | Quiz scroll container |
| `option-{optionId}` | Answer option |
| `check-answer-button` | Check Answer button |
| `next-question-button` | Next/See Results button |
| `results-screen` | Topic results |
| `retry-button` | Retry quiz |
| `home-button` | Back to home |
| `mock-exam-screen` | Mock exam session |
| `timer-display` | Mock exam timer |
| `mock-option-{optionId}` | Mock exam answer option |
| `mock-check-answer-button` | Mock exam check answer |
| `mock-next-question-button` | Mock exam next/see results |
| `mock-exam-results-screen` | Mock exam results |
| `mock-exam-retry-button` | Mock exam retry |
| `paywall-screen` | Paywall |
| `purchase-button` | Purchase CTA |
| `restore-button` | Restore purchase |
| `dismiss-paywall` | Dismiss paywall |
| `confirmation-screen` | Purchase confirmation |
| `confirmation-home` | Confirmation → home |
| `completion-screen` | Topic completion |
| `share-button` | Share button |
| `settings-screen` | Settings |
| `settings-restore-button` | Settings restore |
| `settings-feedback-button` | Settings feedback |
| `progress-screen` | Progress |
| `progress-home-button` | Progress → home |

## RNTL Integration Tests

Located in `app/__tests__/`. These test screen components using React Native Testing Library with mocked dependencies (expo-router, expo-sqlite, AsyncStorage, IAP, PostHog).

### Running

```bash
# All tests (unit + integration)
npx jest

# Integration tests only
npx jest app/__tests__/

# Specific screen
npx jest app/__tests__/settings.test.tsx
```

### Test Structure

Each screen test covers:
1. **Rendering states**: loading, error, empty, data-loaded
2. **User interactions**: taps, navigation, form selection
3. **Edge cases**: missing params, zero scores, boundary values
4. **Accessibility**: all interactive elements have readable labels

## CI Integration (Future)

For CI/CD (GitHub Actions / Bitbucket Pipelines):

```yaml
# Example GitHub Actions step
- name: Run E2E tests
  uses: reactivecircus/android-emulator-runner@v2
  with:
    api-level: 34
    script: |
      bash e2e/scripts/run-e2e.sh
```

## Adding New Tests

1. **Maestro flow**: Create `e2e/flows/my-feature.yaml` with test steps
2. **RNTL screen test**: Create `app/__tests__/my-screen.test.tsx` using `@testing-library/react-native`
3. **Shared mocks**: Add to `src/test-utils/mocks.ts` if needed
4. **Update jest.setup.js**: Add new module mocks if the feature depends on new native modules
