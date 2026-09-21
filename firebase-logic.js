(function () {
  const STORAGE_KEY = "favorite-card-name";
  const nameInput = document.getElementById("nameInput");
  const statusText = document.getElementById("status");
  const cardText = document.getElementById("cardText");

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
