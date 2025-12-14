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

Note: `app.json` contains placeholder bundle identifier / package (`com.example.formulasmart`). Update them to your own identifiers before submitting to app stores.

## Flashcards & Quiz

This project now includes a simple flashcard and quiz module to help practice formulas and word problems.

- Open the app and go to **Choose Subjects** to pick one or more subjects (Tier 1, Tier 2, Tier 3, Shapes, Word Problems, ASVAB) or select **All Flashcards** to practice everything.
- **Flashcards**: Tap a card to flip between the prompt and the answer. For shape prompts, a small shape preview is shown. Word problems include a **Show hint** button on the front of the card.
- **Quiz**: Multiple-choice quiz mode pulls questions from the selected subjects. Select an answer to advance; hints are shown automatically for incorrect word-problem answers.

- **Quiz scoring & history**: When a quiz finishes, the app saves the session (subjects, score, total, timestamp). View chronological sessions in **History**, and see an overall per-subject strength/weakness summary in **Stats Overview**. Use **Settings → Clear saved quiz scores** to clear data.

- **Stats Overview**: Shows per-subject performance aggregated from quiz and flashcard sessions. For each subject you'll see average accuracy, a simple improvement/decline trend, and a per-type breakdown (Formulas/Definitions, Shapes, Word Problems) so you can see where to focus practice.

- **Flashcards reveal & marking**: In Flashcards mode you must tap **Reveal answer** to see the correct formula. After revealing you cannot go back to previous cards — you must proceed forward. When the answer is revealed choose **I got it** or **I missed it** to record whether you answered that card correctly. At the end of a flashcard session the app saves a session record (subjects, score, total, timestamp) which you can view in **History**.

Included data covers the memorization list you provided (Tier 1, Tier 2, Tier 3, ASVAB traps) and example word problems and shapes.

If you'd like:

- I can add persistence for your high scores (saved per subject).
- I can import an SVG logo and use it for the app icon and splash instead of the generated PNG placeholder.

```

Notes:
- Expo SDK: ~54.0.29 (installed `expo` package)
- Project uses TypeScript (`App.tsx`)

Happy hacking! 🚀
```
