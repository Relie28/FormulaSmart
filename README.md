# FormulaSmart

An Expo React Native app (TypeScript) bootstrapped with the latest Expo SDK.

## Quick start

Prerequisites:
- Node >= 20.19.4 (recommended)
- npm or pnpm
- Xcode (for iOS simulator) or Android Studio (for Android emulator)

Install and run:

```bash
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
```

For standalone app builds (recommended with EAS):

1. Install and configure EAS CLI: `npm install -g eas-cli` and `eas login`.
2. Configure credentials and then run `eas build -p ios` or `eas build -p android`.

Note: `app.json` contains placeholder bundle identifier / package (`com.example.formulasmart`). Update them to your own identifiers before submitting to app stores.
```

Notes:
- Expo SDK: ~54.0.29 (installed `expo` package)
- Project uses TypeScript (`App.tsx`)

Happy hacking! 🚀
