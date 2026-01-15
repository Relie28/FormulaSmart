# FormulaSmart

An Expo React Native app (TypeScript) bootstrapped with the latest Expo SDK.

## Quick start

Prerequisites:

- Node >= 20.19.4 (recommended)
- npm or pnpm
- Xcode (for iOS simulator) or Android Studio (for Android emulator)

Install and run:

````bash
# from project root
npm install
npm start        # starts Metro and Expo dev tools
npm run ios      # open iOS simulator
npm run android  # open Android emulator
npm run web      # run in browser

# Additional steps for standalone builds and assets

You can generate placeholder app assets (icon, splash, favicon) with the included script:

```bash
npm run generate-assets
````

For standalone app builds (recommended with EAS):

1. Install and configure EAS CLI: `npm install -g eas-cli` and `eas login`.
2. Configure credentials and then run `eas build -p ios` or `eas build -p android`.

### Over-the-air updates (EAS Update)

We use EAS Update to publish OTA updates to environment-specific branches. The `eas.json` file includes `production`, `staging`, and `development` build profiles which point to their respective release channels. You can publish updates to these channels with the included npm scripts:

```bash
# Publish a staging update
npm run eas:publish:staging

# Publish a development update (development builds)
npm run eas:publish:development

# Publish a production update
npm run eas:publish:production
```

These commands use `eas update --branch <branch>` under the hood; builds created with the matching profile will fetch updates from the corresponding branch.

### Building with EAS (per-environment)

You can run the following npm scripts to invoke `eas build` for each environment and platform:

```bash
# Build staging for both platforms
npm run eas:build:staging

# Build staging for iOS only
npm run eas:build:staging:ios

# Build staging for Android only
npm run eas:build:staging:android

# Build development dev-client (both platforms)
npm run eas:build:development

# Build production (both platforms)
npm run eas:build:production
```

Note: `development` profile is configured for internal/distribution dev-client builds (see `eas.json`). For production and staging builds you'll need appropriate credentials configured in EAS.

Note: `app.json` contains placeholder bundle identifier / package (`com.example.formulasmart`). Update them to your own identifiers before submitting to app stores.

## Troubleshooting EAS build installs (peer dependency errors)

If an EAS build fails during install with errors like ERESOLVE (peer dependency conflicts), common fixes are:

- Update devDependencies so they line up with your `react` version (e.g., bump `react-test-renderer` to a React-19-compatible release when using React 19).
- If you can't immediately update a package, use `--legacy-peer-deps` when installing in CI as a temporary workaround (not ideal long-term).
- Avoid installing dev dependencies on production build nodes when unnecessary; prefer `npm ci --omit=dev` in those contexts.

Example: the build log may show `react-test-renderer@18.x` requiring React 18 while your project uses React 19; updating `react-test-renderer` to a 19.x release usually resolves the conflict.

## Flashcards & Quiz

This project now includes a simple flashcard and quiz module to help practice formulas and word problems.

- Open the app and go to **Choose Subjects** to pick one or more subjects (Arithmetic, Pre-Algebra, Algebra, Geometry, Word Problems, ASVAB) or select **All Flashcards** to practice everything.
- **Flashcards**: Tap a card to flip between the prompt and the answer. For shape prompts, a small shape preview is shown. Word problems include a **Show hint** button on the front of the card.
- **Quiz**: Multiple-choice quiz mode pulls questions from the selected subjects. Select an answer to advance; hints are shown automatically for incorrect word-problem answers.

---

## ASVAB, Adaptive Tiers & Multiple-Choice Logic 🔧

This app includes a full ASVAB-style Math practice mode and deterministic logic to generate plausible multiple-choice distractors that match difficulty tiers so the same behavior can be replicated on web.

### ASVAB two-section behavior ✅

- Two timed sections:
  - **Arithmetic Reasoning (AR)** — 30 minutes
  - **Mathematics Knowledge (MK)** — 15 minutes
- Each section is served by a tiered adaptive engine (see `src/utils/adaptiveAsvab.ts`). When a section timer expires the section completes and the app proceeds to the next section; after both finish an AFQT estimate is computed and saved.

### Adaptive tiers (high level) ⚡

- Content is organized into 6 tiers (Tier 1 .. Tier 6) and each question knows its tier in `src/data/test_questions.json`.
- Adaptive rules (implemented in `AdaptiveSection`):
  - Start in a middle tier (Tier 3) for new sections.
  - Questions are drawn from the current tier; when a tier is exhausted, the engine evaluates tier performance and either promotes, demotes, or stays based on percent-correct thresholds.
  - Fast-track: 2 consecutive correct answers will serve a higher-tier question (if available).
  - Hint mode can be enabled for remediation after repeated failures in the same tier.

### Multiple-choice generation rules (A–D; single correct) 🎯

We implemented reusable logic to generate four plausible choices for each question in `src/utils/choiceGenerator.ts`.

Core rules:

- Exactly 4 choices: one correct + three plausible distractors.
- Distractors are generated to reflect common errors (not random): arithmetic slips, conceptual/formula errors, partial/intermediate results, or rounding/estimation mistakes.
- The distractor types are tier-aware:
  - Tier 1: obvious arithmetic slips and rounding errors
  - Tier 2: single-step traps (misapplied operation or misplaced denominator)
  - Tier 3: multi-step confusions (partial/step-miss answers)
  - Tier 4: conceptual interference (wrong context/ratio)
  - Tier 5: precision/neighbour numeric traps
  - Tier 6: ASVAB "killer" distractors (close neighbors requiring conceptual clarity)

Algorithm summary (pseudo):

```
FUNCTION generateChoices(correctAnswer, tier):
  SET distractors = []
  ADD arithmeticError(correctAnswer)
  ADD conceptualError(correctAnswer)
  IF tier >= 3:
    ADD partialSolution(correctAnswer)
  ELSE:
    ADD roundingError(correctAnswer)
  SHUFFLE [correctAnswer + distractors]
  RETURN choices
```

Each distractor generator attempts to preserve units (e.g., "$", "%", "mph") and produce values that are close to the correct answer but wrong for plausible reasons. The generator returns a `distractor_logic` map to explain the trap (useful for analytics/authoring).

### Submit flow & UX

- Answers are not auto-submitted on tap. The app requires the user to select a choice and then press **Submit Answer** to confirm. This prevents accidental advances and makes the UI consistent across ASVAB and regular quizzes.
- The submit button is disabled until a choice is selected and visually highlights the selected choice.

### Leave protection

- If the user attempts to navigate away mid-quiz (Flashcards or ASVAB), the app shows a confirmation alert "Leave quiz?" warning that progress will be lost. This is implemented via a `beforeRemove` listener in `src/screens/Quiz.tsx` and respects both normal quizzes and an active ASVAB test.

- Implementation details (important for web parity):
  - We only prompt the Leave confirmation when the quiz is genuinely "in-progress": this is true if the ASVAB timer is running (ASVAB active) or the user has submitted at least one answer in the current quiz (`hasSubmitted`). This avoids prompting when the user hasn't begun answering questions.
  - All gesture, header-back and hardware-back interception is scoped to when the `Quiz` screen is focused (we use `useFocusEffect` and `navigation.isFocused()` guards). This prevents other screens from having their back behavior affected.
  - When the user confirms Leave we prefer to call `navigation.goBack()` to return to the previous screen. If `goBack` is not available we fall back to `safeDispatch` which will navigate to `Home` as a last resort.
  - To avoid a double-prompt loop (native pop re-triggering the `beforeRemove` listener), we set an internal `isLeavingRef` flag when the user confirms Leave and the listener will not re-prompt if that flag is set.

### Files & tests related to the Leave flow

- `src/screens/Quiz.tsx` — focus-scoped BackHandler, header-left back button, `beforeRemove` listener, `hasSubmitted` and `isLeavingRef` guards.
- `src/utils/quizUtils.ts` — `isQuizInProgress(...)` helper (unit-tested) that now respects `hasSubmitted` and ASVAB active state.
- `src/utils/navigationUtils.ts` — `shouldPromptLeave(...)` helper (unit-tested) that combines focus + in-progress checks and `hasSubmitted` to decide whether to prompt.
- Tests:
  - `__tests__/quizUtils.test.ts` — verifies `isQuizInProgress` behavior with `hasSubmitted` and ASVAB flags.
  - `__tests__/navigationUtils.test.ts` — verifies `shouldPromptLeave` behavior for focus and submission cases.
  - `__tests__/quiz_leave_static.test.ts` — static assertions for the presence of focus and isLeaving guards and back/gesture handling.

### Porting the Leave behavior to Web

When implementing web behavior, port `isQuizInProgress` and `shouldPromptLeave` helpers first. Use `history.back()`/router goBack equivalents for navigation on web, and wire your beforeunload or in-app back handlers to consult `shouldPromptLeave` so the confirmation behavior is identical across platforms.

### Files of interest

- `src/utils/choiceGenerator.ts` — choice generation algorithm and distractor types.
- `src/utils/adaptiveAsvab.ts` — tier-based AdaptiveSection implementation.
- `src/data/test_questions.json` — tiered ASVAB question bank.
- `src/screens/Quiz.tsx` — wiring for ASVAB, adaptive flow, timers, Submit UI and 'beforeRemove' leave protection.

---

## Testing & Replicating on Web 🧪

We included tests that exercise the deterministic generation logic and important regressions so the same behavior can be reproduced on web.

- Run the full test suite locally:

```bash
npm test
```

- Key tests to validate the features above:
  - `__tests__/choiceGenerator.test.ts` — asserts 4 choices, tier-dependent distractors and reasonable distribution of correct positions.
  - `__tests__/test_questions_filename.test.ts` — protects against filename-case regressions for the `test_questions.json` import.
  - `__tests__/quiz_leave_static.test.ts` — static checks for the leave-confirmation protection.
  - `__tests__/quiz_submit_static.test.ts` — verifies Submit button/signature is present in source.

### Reproducing on Web

1. Port `src/utils/choiceGenerator.ts` and `src/utils/adaptiveAsvab.ts` to the web environment (they are pure JS/TS helpers without native dependencies).
2. Reuse `src/data/test_questions.json` as a shared source of truth.
3. Add tests in your web test runner referencing the same utility functions (the unit tests are deterministic and should pass in Node/browser test environments).

Tip: Keep `distractor_logic` recorded during submissions to capture analytics and evaluate which traps are most effective.

---

If you'd like, I can also add a small guide/example to the README that shows how to port the choice-generation and adaptive logic to a Node/React web project with example tests (Jest) and fixtures.

### ASVAB Practice Test (Math)

- The ASVAB Math practice test consists of two timed sections:
  - **Arithmetic Reasoning (AR)** — 30 minutes (30 questions)
  - **Mathematics Knowledge (MK)** — 15 minutes (15 questions)
- Each section runs independently: when a section's timer expires the section is automatically completed (even if some questions remain unanswered). The test then proceeds to the next section. When both sections finish, the app computes an estimated AFQT score based on the total correct answers across both sections and saves it to your AFQT history.
- You can start the ASVAB practice test from the **Home** screen ("Take a Quiz" → "ASVAB Math Quiz") or from **Choose Subjects** by selecting **ASVAB**.

- **Quiz scoring & history**: When a quiz finishes, the app saves the session (subjects, score, total, timestamp). View chronological sessions in **History**, and see an overall per-subject strength/weakness summary in **Stats Overview**. Use **Settings → Clear saved quiz scores** to clear data.

- **Stats Overview**: Shows per-subject performance aggregated from quiz and flashcard sessions. For each subject you'll see average accuracy, a simple improvement/decline trend, and a per-type breakdown (Formulas/Definitions, Geometry, Word Problems) so you can see where to focus practice.

- **Improved flashcard reveals**: When a formula is revealed on a flashcard, the app now shows a short plain-English explanation above the formula (as if you had searched the formula). For word problems, hints list the operation keywords to look for (e.g., "of" → Multiplication, "per" → Division) instead of revealing the formula outright.

- **Content coverage**: The flashcards include all the items you listed (re-categorized into Arithmetic, Pre-Algebra, and Algebra). Example topics included: Sum, Difference, Product, Quotient, Average, Percent, Rate/Speed, Ratio, Proportion, PEMDAS, Factors & Multiples, Absolute Value, Squares & Square Roots, Reciprocals, Integers, Geometry (shapes), and Word Problems with keyword hints.

- **Flashcards reveal & marking**: In Flashcards mode you must tap **Reveal answer** to see the correct formula. After revealing you cannot go back to previous cards — you must proceed forward. When the answer is revealed choose **I got it** or **I missed it** to record whether you answered that card correctly. At the end of a flashcard session the app saves a session record (subjects, score, total, timestamp) which you can view in **History**.

Included data covers the memorization list you provided (re-categorized) and example word problems and geometry topics.

If you'd like:

- I can add persistence for your high scores (saved per subject).
- I can import an SVG logo and use it for the app icon and splash instead of the generated PNG placeholder.

```

Notes:
- Expo SDK: ~54.0.29 (installed `expo` package)
- Project uses TypeScript (`App.tsx`)

Happy hacking! 🚀
```
