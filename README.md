# Today's Favorite Card

This project is a small static site that shows a favorite card-style page and lets the user enter a name.

## Project structure
- [index.html](index.html): page structure, styling, and UI layout
- [firebase-config.js](firebase-config.js): Firebase web configuration values
- [firebase-logic.js](firebase-logic.js): browser logic for initializing Firebase and saving/loading the name

## How it works
- The user types a name into the input field in the page.
- The app updates the card text immediately as the input changes.
- The current value is saved to browser localStorage as a fallback.
- If Firebase is configured and available, the app also writes to Firestore under the `profile/currentName` document.
- On page load, the app tries to read the saved value from Firestore before falling back to the browser value.

## Firebase setup notes
1. Add your Firebase web config in [firebase-config.js](firebase-config.js).
2. Create a Firestore database in the Firebase console.
3. Keep Firestore rules restricted to authorized users for production.

## Local preview
Run the site locally with:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.
