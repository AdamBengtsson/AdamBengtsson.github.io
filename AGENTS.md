# AGENTS.md

## Project overview

This repository is a small static web app for a simple "Today's Favorite Card" page. It is served as plain HTML/JavaScript and does not use a framework or a build step.

Key files:
- [index.html](index.html): UI, styling, and browser/Firestore logic for saving the user's name.
- [firebase-config.js](firebase-config.js): Firebase config object used by the page.
- [README.md](README.md): currently minimal project notes.

## Working conventions

- Keep changes lightweight and static-site friendly.
- Prefer plain HTML, CSS, and JavaScript instead of introducing a framework or bundler unless the task explicitly requires it.
- Treat the page as a client-side app that may run from a static host such as GitHub Pages or Firebase Hosting.
- Preserve the browser fallback behavior: when Firebase is not configured, the app should still work using `localStorage`.

## Important behavior to preserve

- The page stores the user's name in `localStorage` under `favorite-card-name`.
- When Firebase configuration is valid, the app initializes Firestore and loads the latest saved name from the `names` collection.
- If Firebase is unavailable or unconfigured, the app falls back gracefully and shows a status message instead of crashing.
- The card text updates from the current input value and keeps the page usable even with empty input.

## Editing guidance

- For UI tweaks, edit the markup and CSS in [index.html](index.html).
- For Firebase credentials, update [firebase-config.js](firebase-config.js) only.
- Keep the page accessible: status text should use `aria-live="polite"`, and input elements should maintain valid labels.
- When changing save/load logic, ensure the app still supports both `localStorage` and Firestore flows.

## Validation

Because this project is static HTML, there is no app-specific test suite. Validate changes by:

1. Opening the page in a browser or a local static server.
2. Confirming the form accepts input and updates the displayed card text.
3. Checking that the page still works without valid Firebase configuration.

A simple local check is:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.
