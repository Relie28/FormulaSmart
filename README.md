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
