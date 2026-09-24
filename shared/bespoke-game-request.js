(function (global) {
  "use strict";

  const STORAGE_KEY = "bespokeGameRequest";
  const VERSION = 1;
  const VALID_MODES = ["narrative", "platformer"];
  const MAX_PROMPT_LENGTH = 1000;

  // Validate every field before a request is saved or used by either engine.
  function validate(request, expectedMode) {
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return invalid("The saved game request is missing or malformed.");
    }

    if (request.version !== VERSION) {
      return invalid("The saved game request uses an unsupported version.");
    }

    if (typeof request.prompt !== "string" || request.prompt.trim() === "") {
      return invalid("Please enter a game description.");
    }

    if (request.prompt.length > MAX_PROMPT_LENGTH) {
      return invalid("The game description must be 1,000 characters or fewer.");
    }

    if (!VALID_MODES.includes(request.mode)) {
      return invalid("The game mode must be narrative or platformer.");
    }

    if (expectedMode && request.mode !== expectedMode) {
      return invalid("This request belongs to the other game mode.");
    }

    if (
      typeof request.createdAt !== "string" ||
      Number.isNaN(Date.parse(request.createdAt))
    ) {
      return invalid("The saved game request has an invalid creation time.");
    }

    return { ok: true, request: request };
  }

  // Create one predictable JSON-ready request object for both applications.
  function create(prompt, mode) {
    return {
      version: VERSION,
      prompt: typeof prompt === "string" ? prompt.trim() : prompt,
      mode: mode,
      createdAt: new Date().toISOString()
    };
  }

  // Save the validated request under the one shared localStorage key.
  function save(prompt, mode) {
    const request = create(prompt, mode);

    // Every new generation gets a later request time, even if two clicks occur
    // within the same millisecond. Story progress uses this value to isolate runs.
    try {
      const previousValue = global.localStorage.getItem(STORAGE_KEY);
      const previousRequest = previousValue ? JSON.parse(previousValue) : null;
      const previousTime = previousRequest && Date.parse(previousRequest.createdAt);
      const requestTime = Date.parse(request.createdAt);
      if (Number.isFinite(previousTime) && previousTime >= requestTime) {
        request.createdAt = new Date(previousTime + 1).toISOString();
      }
    } catch (error) {
      // A malformed previous request is safely replaced by the new valid one.
    }

    const result = validate(request);

    if (!result.ok) {
      return result;
    }

    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
      return { ok: true, request: request };
    } catch (error) {
      return invalid("The game request could not be saved in this browser.");
    }
  }

  // Load and parse the saved request before an engine tries to use it.
  function load(expectedMode) {
    let savedValue;

    try {
      savedValue = global.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return invalid("The saved game request could not be read in this browser.");
    }

    if (!savedValue) {
      return invalid("No game request was found. Please return to the launcher.");
    }

    try {
      return validate(JSON.parse(savedValue), expectedMode);
    } catch (error) {
      return invalid("The saved game request is malformed. Please return to the launcher.");
    }
  }

  function invalid(message) {
    return { ok: false, error: message };
  }

  global.BespokeGameRequest = {
    key: STORAGE_KEY,
    create: create,
    save: save,
    load: load,
    validate: validate
  };
})(window);
