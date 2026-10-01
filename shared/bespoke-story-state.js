(function () {
  "use strict";

  const STORAGE_KEY = "bespokePlatformerStoryProgress";
  const LEGACY_STORAGE_KEY = "bespokePlatformerGameState";
  const SCHEMA_VERSION = 2;
  const EFFECT_TYPES = ["setFlag", "addInventory", "setObjective", "unlockRoute"];

  function createRunId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "run-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  // A new run receives clean story progress but does not touch user uploads/settings.
  function createDefaultState(options) {
    const settings = options || {};

    return {
      schemaVersion: SCHEMA_VERSION,
      storyId: settings.storyId || "",
      runId: settings.runId || createRunId(),
      requestCreatedAt: settings.requestCreatedAt || "",
      flags: {},
      inventory: [],
      currentObjective: settings.currentObjective || "Reach the collectible.",
      completedDialogueNodes: [],
      unlockedRoutes: [],
      defeatedEnemyIds: []
    };
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isStringArray(value) {
    return Array.isArray(value) && value.every(function (item) {
      return typeof item === "string" && item.length > 0;
    });
  }

  // Validate saved data before the platformer trusts or restores it.
  function validateGameState(state, expectedStoryId) {
    const errors = [];

    if (!isPlainObject(state)) {
      return { ok: false, errors: ["The saved game state is not an object."] };
    }

    if (state.schemaVersion !== SCHEMA_VERSION) errors.push("The saved story schema is unsupported.");
    if (typeof state.storyId !== "string" || !state.storyId) errors.push("The saved story needs a story ID.");
    if (expectedStoryId && state.storyId !== expectedStoryId) errors.push("The saved progress belongs to a different story.");
    if (typeof state.runId !== "string" || !state.runId) errors.push("The saved story needs a run ID.");
    if (typeof state.requestCreatedAt !== "string") errors.push("The saved request date is invalid.");
    if (!isPlainObject(state.flags)) errors.push("Game-state flags must be an object.");
    if (isPlainObject(state.flags) && Object.values(state.flags).some(function (value) {
      return typeof value !== "boolean";
    })) errors.push("Every game-state flag must be true or false.");
    if (!isStringArray(state.inventory)) errors.push("Game-state inventory must contain item IDs.");
    if (typeof state.currentObjective !== "string" || !state.currentObjective.trim()) {
      errors.push("The current objective must be nonempty text.");
    }
    if (!isStringArray(state.completedDialogueNodes)) {
      errors.push("Completed dialogue nodes must contain node IDs.");
    }
    if (!isStringArray(state.unlockedRoutes)) {
      errors.push("Unlocked routes must contain route IDs.");
    }
    if (!isStringArray(state.defeatedEnemyIds)) {
      errors.push("Defeated enemies must contain enemy IDs.");
    }

    return { ok: errors.length === 0, errors: errors };
  }

  // Start a clean run and overwrite progress from the previous run only.
  function startNewGame(options) {
    const state = createDefaultState(options);
    const result = validateGameState(state, state.storyId);

    if (!result.ok) return { ok: false, state: state, errors: result.errors };

    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.warn("[BespokeStoryState] Legacy progress could not be removed:", error);
    }

    const saveResult = save(state);
    return { ok: saveResult.ok, state: state, errors: saveResult.errors || [] };
  }

  // Continue only when the schema, story, and originating request all match.
  function continueGame(storyId, requestCreatedAt) {
    try {
      const savedValue = localStorage.getItem(STORAGE_KEY);
      if (!savedValue) return { ok: false, reason: "missing" };

      const state = JSON.parse(savedValue);

      // Older compatible runs did not record defeated enemies. Add the empty
      // list once so those runs can continue without losing dialogue progress.
      const migratedDefeatedEnemies = state && state.schemaVersion === SCHEMA_VERSION &&
        state.defeatedEnemyIds === undefined;
      if (migratedDefeatedEnemies) state.defeatedEnemyIds = [];

      const result = validateGameState(state, storyId);

      if (!result.ok) {
        console.warn("[BespokeStoryState] Incompatible saved state ignored:", result.errors);
        return { ok: false, reason: "incompatible", errors: result.errors };
      }
      if (state.requestCreatedAt !== requestCreatedAt) {
        return { ok: false, reason: "new-request" };
      }

      if (migratedDefeatedEnemies) save(state);

      return { ok: true, state: state };
    } catch (error) {
      console.warn("[BespokeStoryState] Saved state could not be loaded:", error);
      return { ok: false, reason: "invalid" };
    }
  }

  function save(state) {
    const result = validateGameState(state);
    if (!result.ok) return { ok: false, errors: result.errors };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { ok: true };
    } catch (error) {
      console.warn("[BespokeStoryState] State could not be saved:", error);
      return { ok: false, errors: ["Story progress could not be saved."] };
    }
  }

  function validateEffect(effect) {
    if (!isPlainObject(effect) || typeof effect.type !== "string") {
      return { ok: false, warning: "An effect is missing a valid type." };
    }
    if (!EFFECT_TYPES.includes(effect.type)) {
      return { ok: false, warning: "Unknown effect type '" + effect.type + "'." };
    }
    if (effect.type === "setFlag" &&
        (typeof effect.flag !== "string" || !effect.flag || typeof effect.value !== "boolean")) {
      return { ok: false, warning: "A setFlag effect is malformed." };
    }
    if (effect.type === "addInventory" && (typeof effect.item !== "string" || !effect.item)) {
      return { ok: false, warning: "An addInventory effect is malformed." };
    }
    if (effect.type === "setObjective" &&
        (typeof effect.objective !== "string" || !effect.objective.trim())) {
      return { ok: false, warning: "A setObjective effect is malformed." };
    }
    if (effect.type === "unlockRoute" && (typeof effect.routeId !== "string" || !effect.routeId)) {
      return { ok: false, warning: "An unlockRoute effect is malformed." };
    }
    return { ok: true };
  }

  // Validate every node, choice, next-node reference, and effect before play.
  function validateStoryGraph(graph) {
    const errors = [];
    const warnings = [];
    // Only declared nodes belong in this lookup; inherited object names are not scenes.
    const nodeMap = Object.create(null);

    if (!isPlainObject(graph) || !Array.isArray(graph.nodes)) {
      return { ok: false, errors: ["The story graph must contain a nodes array."], warnings: [], nodeMap: nodeMap };
    }

    graph.nodes.forEach(function (node, nodeIndex) {
      if (!isPlainObject(node) || typeof node.id !== "string" || !node.id) {
        errors.push("Node " + nodeIndex + " needs a nonempty ID.");
        return;
      }
      if (nodeMap[node.id]) errors.push("Dialogue node IDs must be unique: " + node.id + ".");
      nodeMap[node.id] = node;
      if (typeof node.speaker !== "string" || !node.speaker.trim()) errors.push("Node " + node.id + " needs a speaker.");
      if (typeof node.dialogue !== "string" || !node.dialogue.trim()) errors.push("Node " + node.id + " needs dialogue text.");
      if (!Array.isArray(node.choices) || node.choices.length === 0) {
        errors.push("Node " + node.id + " needs at least one choice.");
        return;
      }
      node.choices.forEach(function (choice, choiceIndex) {
        const label = "Choice " + choiceIndex + " in " + node.id;
        if (!isPlainObject(choice) || typeof choice.id !== "string" || !choice.id) errors.push(label + " needs an ID.");
        if (!isPlainObject(choice) || typeof choice.text !== "string" || !choice.text.trim()) errors.push(label + " needs text.");
        if (isPlainObject(choice) && choice.nextNodeId !== null &&
            (typeof choice.nextNodeId !== "string" || !choice.nextNodeId)) {
          errors.push(label + " has an invalid next-node ID.");
        }
        if (!isPlainObject(choice) || !Array.isArray(choice.effects)) {
          errors.push(label + " needs an effects array.");
          return;
        }
        choice.effects.forEach(function (effect) {
          const effectResult = validateEffect(effect);
          if (!effectResult.ok) warnings.push(label + ": " + effectResult.warning);
        });
      });
    });

    if (typeof graph.startNodeId !== "string" || !nodeMap[graph.startNodeId]) {
      errors.push("The story graph start node does not exist.");
    }
    graph.nodes.forEach(function (node) {
      if (!isPlainObject(node) || !Array.isArray(node.choices)) return;
      node.choices.forEach(function (choice) {
        if (isPlainObject(choice) && choice.nextNodeId && !nodeMap[choice.nextNodeId]) {
          errors.push("Choice " + choice.id + " points to missing node " + choice.nextNodeId + ".");
        }
      });
    });

    warnings.forEach(function (warning) {
      console.warn("[BespokeStoryState] " + warning + " It will be ignored.");
    });
    return { ok: errors.length === 0, errors: errors, warnings: warnings, nodeMap: nodeMap };
  }

  function applyChoice(state, nodeId, effects) {
    const stateResult = validateGameState(state);
    if (!stateResult.ok) return { ok: false, state: state, errors: stateResult.errors };

    // A completed node is immutable, so its effects can never run twice.
    if (state.completedDialogueNodes.includes(nodeId)) {
      return { ok: true, state: state, alreadyApplied: true };
    }

    const nextState = JSON.parse(JSON.stringify(state));
    nextState.completedDialogueNodes.push(nodeId);

    effects.forEach(function (effect) {
      const result = validateEffect(effect);
      if (!result.ok) {
        console.warn("[BespokeStoryState] " + result.warning + " It was ignored safely.");
        return;
      }
      if (effect.type === "setFlag") nextState.flags[effect.flag] = effect.value;
      if (effect.type === "addInventory" && !nextState.inventory.includes(effect.item)) nextState.inventory.push(effect.item);
      if (effect.type === "setObjective") nextState.currentObjective = effect.objective;
      if (effect.type === "unlockRoute" && !nextState.unlockedRoutes.includes(effect.routeId)) {
        nextState.unlockedRoutes.push(effect.routeId);
      }
    });

    const saveResult = save(nextState);
    return { ok: saveResult.ok, state: nextState, errors: saveResult.errors || [] };
  }

  // Record one configured enemy defeat in the current run. Repeated impacts
  // cannot apply the objective or route unlock more than once.
  function recordEnemyDefeat(state, enemyId, objective, routeId) {
    const stateResult = validateGameState(state);
    if (!stateResult.ok) return { ok: false, state: state, errors: stateResult.errors };
    if (typeof enemyId !== "string" || !enemyId ||
        typeof objective !== "string" || !objective.trim() ||
        typeof routeId !== "string" || !routeId) {
      return { ok: false, state: state, errors: ["The enemy defeat configuration is invalid."] };
    }
    if (state.defeatedEnemyIds.includes(enemyId)) {
      return { ok: true, state: state, alreadyApplied: true };
    }

    const nextState = JSON.parse(JSON.stringify(state));
    nextState.defeatedEnemyIds.push(enemyId);
    nextState.currentObjective = objective;
    if (!nextState.unlockedRoutes.includes(routeId)) nextState.unlockedRoutes.push(routeId);

    const saveResult = save(nextState);
    return { ok: saveResult.ok, state: nextState, errors: saveResult.errors || [] };
  }

  window.BespokeStoryState = {
    STORAGE_KEY: STORAGE_KEY,
    SCHEMA_VERSION: SCHEMA_VERSION,
    createDefaultState: createDefaultState,
    validateGameState: validateGameState,
    validateStoryGraph: validateStoryGraph,
    applyChoice: applyChoice,
    recordEnemyDefeat: recordEnemyDefeat,
    startNewGame: startNewGame,
    continueGame: continueGame,
    save: save
  };
})();
