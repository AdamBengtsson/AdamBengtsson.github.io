(function () {
  /**
   * This file contains the browser-side behavior for the name field.
   *
   * The page keeps a lightweight static UI, while this script handles:
   * - reading the saved value from storage
   * - initializing Firebase when config is available
   * - saving the current name to Firestore
   * - falling back to localStorage if Firebase is not usable
   */
  const STORAGE_KEY = "favorite-card-name";
  const nameInput = document.getElementById("nameInput");
  const statusText = document.getElementById("status");
  const cardText = document.getElementById("cardText");

  // Firebase config is provided by firebase-config.js and attached to window.
  const config = window.firebaseConfig || {};
  const hasValidConfig = Object.values(config).every(
    (value) => typeof value === "string" && value.trim() && !value.startsWith("YOUR_")
  );

  if (hasValidConfig && window.firebase) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
    } catch (error) {
      console.warn("Firebase initialization failed; using browser storage fallback.", error);
    }
  }

  const db = hasValidConfig && window.firebase && firebase.firestore ? firebase.firestore() : null;
  const profileDoc = db ? db.collection("profile").doc("currentName") : null;

  /**
   * Keep a browser fallback in localStorage so the page still works even when
   * Firebase is unavailable or the config has not yet been completed.
   */
  function saveLocalName(value) {
    const trimmedValue = (value || "").trim();
    if (trimmedValue) {
      localStorage.setItem(STORAGE_KEY, trimmedValue);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function loadLocalName() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      console.warn("Unable to read the browser storage value.", error);
      return "";
    }
  }

  /**
   * Keep the displayed card text in sync with the current input value.
   */
  function updateCardMessage(name) {
    const trimmedValue = (name || "").trim();
    if (!trimmedValue) {
      cardText.textContent = "This is a placeholder for the card text. Add your favorite card message here.";
      return;
    }

    cardText.textContent = `Hello, ${trimmedValue}! This is your saved name.`;
  }

  function setStatus(message) {
    statusText.textContent = message;
  }

  /**
   * Load the latest saved name from Firestore when possible.
   * If Firebase is not ready, reuse the browser fallback value.
   */
  async function loadSavedName() {
    const fallbackName = loadLocalName();
    nameInput.value = fallbackName;
    updateCardMessage(fallbackName);

    if (!profileDoc) {
      setStatus("Using browser storage until Firebase is configured.");
      return;
    }

    try {
      const snapshot = await profileDoc.get();
      if (snapshot && snapshot.exists) {
        const firebaseName = snapshot.data().name || "";
        nameInput.value = firebaseName;
        saveLocalName(firebaseName);
        updateCardMessage(firebaseName);
        setStatus("Loaded from Firebase.");
        return;
      }

      setStatus(fallbackName ? "Loaded from browser storage." : "No saved name yet.");
    } catch (error) {
      console.warn("Unable to read Firebase value; using browser storage.", error);
      setStatus("Loaded from browser storage.");
    }
  }

  /**
   * Save the current value to both browser storage and Firestore when available.
   */
  async function saveName() {
    const trimmedValue = (nameInput.value || "").trim();
    saveLocalName(trimmedValue);
    updateCardMessage(trimmedValue);

    if (!profileDoc) {
      setStatus(trimmedValue ? "Saved in this browser." : "Cleared from this browser.");
      return;
    }

    try {
      await profileDoc.set({ name: trimmedValue }, { merge: true });
      setStatus(trimmedValue ? "Saved to Firebase." : "Cleared from Firebase.");
    } catch (error) {
      console.warn("Firebase save failed, but browser storage was updated.", error);
      setStatus("Saved in this browser; Firebase save failed.");
    }
  }

  nameInput.addEventListener("input", saveName);
  loadSavedName();
})();
