const API_BASE_URL = "https://openapi.programming-hero.com/api";

const state = {
  activeLevelId: null,
  currentWords: [],
  allWords: [],
  allWordsLoaded: false,
  savedWords: loadSavedWords(),
};

const elements = {
  lessonButtons: document.getElementById("lesson-buttons"),
  wordGrid: document.getElementById("word-grid"),
  savedGrid: document.getElementById("saved-grid"),
  statusMessage: document.getElementById("status-message"),
  loadingIndicator: document.getElementById("loading-indicator"),
  searchInput: document.getElementById("search-input"),
  savedCount: document.getElementById("saved-count"),
  modal: document.getElementById("word-modal"),
  modalContent: document.getElementById("word-modal-content"),
  modalCloseTop: document.getElementById("modal-close-top"),
  modalCloseBottom: document.getElementById("modal-close-bottom"),
};

document.addEventListener("DOMContentLoaded", () => {
  renderSavedWords();
  loadLevels();
  wireEvents();
});

function wireEvents() {
  const debouncedSearch = debounce(handleSearch, 300);
  elements.searchInput.addEventListener("input", (event) => {
    debouncedSearch(event.target.value.trim());
  });

  elements.modalCloseTop.addEventListener("click", () => elements.modal.close());
  elements.modalCloseBottom.addEventListener("click", () => elements.modal.close());
}

async function loadLevels() {
  showLoading(false);
  updateStatus({
    title: "Loading lessons...",
    description: "Please wait while we prepare the lesson buttons.",
    badge: "API",
  });

  try {
    const data = await fetchJson(`${API_BASE_URL}/levels/all`);
    const levels = data?.data || [];

    if (!levels.length) {
      updateStatus({
        title: "No lessons available right now.",
        description: "The lessons API returned an empty response. Please try again later.",
        badge: "Empty",
      });
      return;
    }

    renderLessonButtons(levels);
    updateStatus({
      title: "Select a lesson to load vocabulary cards.",
      description: "You can also search by typing in the search box. Searching will reset the active lesson button.",
      badge: "Start here",
    });
  } catch (error) {
    updateStatus({
      title: "Unable to load lessons.",
      description: "The lesson API could not be reached. Check your connection and try again.",
      badge: "Error",
    });
  }
}

function renderLessonButtons(levels) {
  elements.lessonButtons.innerHTML = levels
    .map((level) => {
      const levelId = escapeHtml(level.level_no ?? level.id ?? "");
      const levelName = escapeHtml(level.lessonName ?? level.name ?? `Lesson ${levelId}`);
      return `
        <button class="lesson-button" data-level-id="${levelId}">
          <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
          ${levelName}
        </button>
      `;
    })
    .join("");

  elements.lessonButtons.querySelectorAll(".lesson-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const levelId = button.dataset.levelId;
      elements.searchInput.value = "";
      setActiveButton(levelId);
      await loadWordsByLevel(levelId);
    });
  });
}

async function loadWordsByLevel(levelId) {
  showLoading(true);
  state.activeLevelId = levelId;
  elements.wordGrid.innerHTML = "";

  try {
    const data = await fetchJson(`${API_BASE_URL}/level/${levelId}`);
    const words = data?.data || [];
    state.currentWords = words;

    if (!words.length) {
      updateStatus({
        title: "No Word Found",
        description: "This lesson does not have vocabulary yet. Try another lesson.",
        badge: "Lesson empty",
      });
      return;
    }

    updateStatus({
      title: `Lesson ${levelId} loaded successfully.`,
      description: "Tap the info icon for details, the speaker for pronunciation, or the heart to save a word.",
      badge: "Ready",
    });
    renderWordCards(words);
  } catch (error) {
    updateStatus({
      title: "Unable to load words for this lesson.",
      description: "The vocabulary API request failed. Please try another lesson or reload the page.",
      badge: "Error",
    });
  } finally {
    showLoading(false);
  }
}

async function handleSearch(query) {
  if (!query) {
    if (state.activeLevelId && state.currentWords.length) {
      updateStatus({
        title: `Showing Lesson ${state.activeLevelId}.`,
        description: "Search cleared. Your active lesson words are visible again.",
        badge: "Lesson view",
      });
      renderWordCards(state.currentWords);
      return;
    }

    elements.wordGrid.innerHTML = "";
    updateStatus({
      title: "Select a lesson to load vocabulary cards.",
      description: "You can also search by typing in the search box. Searching will reset the active lesson button.",
      badge: "Start here",
    });
    return;
  }

  clearActiveButton();
  state.activeLevelId = null;

  if (!state.allWordsLoaded) {
    showLoading(true);

    try {
      const data = await fetchJson(`${API_BASE_URL}/words/all`);
      state.allWords = data?.data || [];
      state.allWordsLoaded = true;
    } catch (error) {
      state.allWords = state.currentWords;
    } finally {
      showLoading(false);
    }
  }

  const normalizedQuery = query.toLowerCase();
  const filteredWords = state.allWords.filter((word) => {
    const englishWord = String(word.word ?? "").toLowerCase();
    const meaning = String(word.meaning ?? word.word_meaning ?? "").toLowerCase();
    const pronunciation = String(word.pronunciation ?? "").toLowerCase();

    return (
      englishWord.includes(normalizedQuery) ||
      meaning.includes(normalizedQuery) ||
      pronunciation.includes(normalizedQuery)
    );
  });

  if (!filteredWords.length) {
    elements.wordGrid.innerHTML = "";
    updateStatus({
      title: "No matching words found.",
      description: `We could not find any vocabulary for "${query}". Try a different keyword.`,
      badge: "Search",
    });
    return;
  }

  updateStatus({
    title: `${filteredWords.length} word${filteredWords.length > 1 ? "s" : ""} found.`,
    description: `Search results for "${query}" are shown below.`,
    badge: "Search",
  });
  renderWordCards(filteredWords);
}

function renderWordCards(words) {
  elements.wordGrid.innerHTML = words
    .map((word) => {
      const wordId = String(word.id ?? word.word_id ?? word.wordId ?? "");
      const title = sanitizeValue(word.word, "Unknown word");
      const meaning = sanitizeValue(word.meaning ?? word.word_meaning, "Meaning not available");
      const pronunciation = sanitizeValue(word.pronunciation, "Pronunciation not available");
      const isSaved = state.savedWords.some((savedWord) => savedWord.wordId === wordId);

      return `
        <article class="word-card">
          <span class="badge badge-outline badge-primary">Vocabulary</span>
          <h3>${escapeHtml(title)}</h3>
          <p class="word-meta">
            <strong>Meaning:</strong> ${escapeHtml(meaning)}<br>
            <strong>Pronunciation:</strong> ${escapeHtml(pronunciation)}
          </p>
          <div class="card-actions">
            <button class="icon-btn" type="button" data-action="details" data-word-id="${escapeHtml(wordId)}" aria-label="View details">
              <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
            </button>
            <button class="icon-btn" type="button" data-action="pronounce" data-word="${escapeHtml(title)}" aria-label="Pronounce word">
              <i class="fa-solid fa-volume-high" aria-hidden="true"></i>
            </button>
            <button class="icon-btn ${isSaved ? "is-saved" : ""}" type="button" data-action="save" data-word-id="${escapeHtml(wordId)}" aria-label="Save word">
              <i class="fa-solid fa-heart" aria-hidden="true"></i>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  bindWordCardActions(words);
}

function bindWordCardActions(words) {
  elements.wordGrid.querySelectorAll("[data-action='details']").forEach((button) => {
    button.addEventListener("click", async () => {
      await showWordDetails(button.dataset.wordId);
    });
  });

  elements.wordGrid.querySelectorAll("[data-action='pronounce']").forEach((button) => {
    button.addEventListener("click", () => {
      pronounceWord(button.dataset.word);
    });
  });

  elements.wordGrid.querySelectorAll("[data-action='save']").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedWord = words.find((word) => {
        const wordId = String(word.id ?? word.word_id ?? word.wordId ?? "");
        return wordId === button.dataset.wordId;
      });

      if (!selectedWord) {
        return;
      }

      toggleSaveWord(selectedWord);
      renderWordCards(words);
      renderSavedWords();
    });
  });
}

async function showWordDetails(wordId) {
  elements.modalContent.innerHTML = `
    <div class="loading-state">
      <span class="loading loading-spinner loading-md text-primary"></span>
      <p>Loading word details...</p>
    </div>
  `;
  elements.modal.showModal();

  try {
    const data = await fetchJson(`${API_BASE_URL}/word/${wordId}`);
    const word = data?.data || {};
    const title = sanitizeValue(word.word, "Unknown word");
    const pronunciation = sanitizeValue(word.pronunciation, "Pronunciation not available");
    const meaning = sanitizeValue(word.meaning ?? word.word_meaning, "Meaning not available");
    const sentence = sanitizeValue(word.sentence ?? word.example, "No example sentence available");
    const synonyms = normalizeSynonyms(word.synonyms);

    elements.modalContent.innerHTML = `
      <div>
        <span class="badge badge-primary badge-outline">Word detail</span>
        <h3 class="word-modal-title mt-3">${escapeHtml(title)}</h3>
        <p class="word-meta">
          <strong>Meaning:</strong> ${escapeHtml(meaning)}<br>
          <strong>Pronunciation:</strong> ${escapeHtml(pronunciation)}
        </p>

        <div class="modal-section">
          <p class="modal-label"><strong>Example sentence</strong></p>
          <p>${escapeHtml(sentence)}</p>
        </div>

        <div class="modal-section">
          <p class="modal-label"><strong>Synonyms</strong></p>
          <div class="modal-tags">
            ${synonyms.map((synonym) => `<span class="modal-tag">${escapeHtml(synonym)}</span>`).join("")}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    elements.modalContent.innerHTML = `
      <div class="empty-state">
        <span class="badge badge-error badge-outline">Error</span>
        <h3>Could not load word details.</h3>
        <p>Please close the modal and try again.</p>
      </div>
    `;
  }
}

function toggleSaveWord(word) {
  const wordId = String(word.id ?? word.word_id ?? word.wordId ?? "");
  const existingIndex = state.savedWords.findIndex((savedWord) => savedWord.wordId === wordId);

  if (existingIndex >= 0) {
    state.savedWords.splice(existingIndex, 1);
  } else {
    state.savedWords.unshift({
      wordId,
      word: sanitizeValue(word.word, "Unknown word"),
      meaning: sanitizeValue(word.meaning ?? word.word_meaning, "Meaning not available"),
      pronunciation: sanitizeValue(word.pronunciation, "Pronunciation not available"),
    });
  }

  persistSavedWords();
}

function renderSavedWords() {
  elements.savedCount.textContent = String(state.savedWords.length);

  if (!state.savedWords.length) {
    elements.savedGrid.innerHTML = `
      <div class="surface-card empty-state">
        <span class="badge badge-outline">Saved words</span>
        <h3>No saved words yet.</h3>
        <p>Click the heart icon on any vocabulary card to bookmark it here.</p>
      </div>
    `;
    return;
  }

  elements.savedGrid.innerHTML = state.savedWords
    .map((word) => {
      return `
        <article class="saved-card">
          <h3>${escapeHtml(word.word)}</h3>
          <p class="saved-meta">
            <strong>Meaning:</strong> ${escapeHtml(word.meaning)}<br>
            <strong>Pronunciation:</strong> ${escapeHtml(word.pronunciation)}
          </p>
          <button class="btn btn-outline btn-sm remove-saved-button" type="button" data-saved-word-id="${escapeHtml(word.wordId)}">
            Remove
          </button>
        </article>
      `;
    })
    .join("");

  elements.savedGrid.querySelectorAll(".remove-saved-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.savedWords = state.savedWords.filter((word) => word.wordId !== button.dataset.savedWordId);
      persistSavedWords();
      renderSavedWords();

      if (state.currentWords.length) {
        renderWordCards(state.currentWords);
      } else if (elements.wordGrid.children.length) {
        const query = elements.searchInput.value.trim();
        if (query) {
          handleSearch(query);
        }
      }
    });
  });
}

function setActiveButton(levelId) {
  elements.lessonButtons.querySelectorAll(".lesson-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.levelId === String(levelId));
  });
}

function clearActiveButton() {
  elements.lessonButtons.querySelectorAll(".lesson-button").forEach((button) => {
    button.classList.remove("active");
  });
}

function updateStatus({ title, description, badge }) {
  elements.statusMessage.classList.remove("hidden");
  elements.statusMessage.innerHTML = `
    <span class="badge badge-primary badge-outline">${escapeHtml(badge)}</span>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(description)}</p>
  `;
}

function showLoading(isLoading) {
  elements.loadingIndicator.classList.toggle("hidden", !isLoading);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function pronounceWord(word) {
  if (!word || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-EN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function loadSavedWords() {
  try {
    return JSON.parse(localStorage.getItem("english-janala-saved-words")) || [];
  } catch (error) {
    return [];
  }
}

function persistSavedWords() {
  localStorage.setItem("english-janala-saved-words", JSON.stringify(state.savedWords));
}

function sanitizeValue(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function normalizeSynonyms(synonyms) {
  if (Array.isArray(synonyms) && synonyms.length) {
    return synonyms.filter(Boolean).map(String);
  }

  if (typeof synonyms === "string" && synonyms.trim()) {
    return synonyms
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return ["No synonyms available"];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}
