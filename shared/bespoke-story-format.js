(function (root) {
  "use strict";

  // Data only: story files cannot supply scripts, HTML, URLs, or new mechanics.
  const MAX_BYTES = 200000;
  const ASSETS = Object.freeze([
    "calm-ocean", "coral-reef", "current-route", "trench-route", "ruins-route",
    "whirlpool", "whale-water", "whale", "surface-route", "submersible", "hidden-lagoon"
  ].map(name => "assets/" + name + ".svg"));
  const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
  const id = value => typeof value === "string" && /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(value) &&
    !["constructor", "prototype", "__proto__"].includes(value);

  function validate(config) {
    const errors = [];
    const nodeMap = Object.create(null);
    const fail = message => { if (errors.length < 20) errors.push(message); };
    const result = () => ({ ok: errors.length === 0, errors, nodeMap });
    function keys(value, allowed, label) {
      Object.keys(value).forEach(key => {
        if (!allowed.includes(key)) fail(label + ": unsupported field “" + key + "”.");
      });
    }
    function condition(value, label) {
      if (!object(value) || !id(value.flag) || typeof value.equals !== "boolean") {
        fail(label + ": condition needs a flag name and a boolean equals value.");
        return;
      }
      keys(value, ["flag", "equals"], label);
      conditions.add(value.flag);
    }
    function visual(value, label, conditional) {
      if (!object(value)) { fail(label + ": an illustration is required."); return; }
      keys(value, ["background", "backgroundAlt", "character", "characterAlt"].concat(conditional ? ["when"] : []), label);
      if (!ASSETS.includes(value.background) || !text(value.backgroundAlt, 500)) {
        fail(label + ": use a bundled background path and descriptive backgroundAlt text.");
      }
      if (value.character !== undefined && (!ASSETS.includes(value.character) || !text(value.characterAlt, 500))) {
        fail(label + ": use a bundled character path and descriptive characterAlt text.");
      }
      if (value.characterAlt !== undefined && value.character === undefined) fail(label + ": characterAlt needs a character.");
      if (conditional) condition(value.when, label);
    }
    const flags = new Set();
    const conditions = new Set();
    if (!object(config)) { fail("A story must be a JSON object."); return result(); }
    keys(config, ["schemaVersion", "id", "title", "startNodeId", "sceneCount", "whaleEncounterNodeId", "nodes"], "Story");
    if (config.schemaVersion !== 1) fail("This player supports story schemaVersion 1.");
    if (!id(config.id)) fail("Story needs a valid id (letters, numbers, hyphens, or underscores).");
    if (!text(config.title, 120)) fail("Story needs a title of 1–120 characters.");
    if (!id(config.startNodeId)) fail("Story needs a valid startNodeId.");
    if (!Number.isInteger(config.sceneCount) || config.sceneCount < 5 || config.sceneCount > 7) {
      fail("sceneCount must be the longest playthrough length, from 5 to 7.");
    }
    if (!Array.isArray(config.nodes) || config.nodes.length < 1 || config.nodes.length > 32) {
      fail("Story must contain 1–32 scene nodes."); return result();
    }
    config.nodes.forEach((node, index) => {
      const label = "Scene " + (object(node) && id(node.id) ? node.id : index + 1);
      if (!object(node)) { fail(label + " must be an object."); return; }
      keys(node, ["id", "text", "visual", "visualVariants", "textVariants", "choices", "ending"], label);
      if (!id(node.id) || nodeMap[node.id]) fail(label + ": scene IDs must be valid and unique.");
      else nodeMap[node.id] = node;
      if (!text(node.text, 4000)) fail(label + ": text must contain 1–4,000 characters.");
      if (node.ending !== undefined && typeof node.ending !== "boolean") fail(label + ": ending must be true or false.");
      visual(node.visual, label, false);
      for (const type of ["textVariants", "visualVariants"]) {
        if (node[type] === undefined) continue;
        if (!Array.isArray(node[type]) || node[type].length > 8) {
          fail(label + ": " + type + " must be an array of at most 8 variants."); continue;
        }
        node[type].forEach(variant => {
          if (type === "visualVariants") { visual(variant, label, true); return; }
          if (!object(variant)) { fail(label + ": text variant must be an object."); return; }
          keys(variant, ["when", "text"], label);
          condition(variant.when, label);
          if (!text(variant.text, 4000)) fail(label + ": text variant needs 1–4,000 characters.");
        });
      }
      if (!Array.isArray(node.choices) || node.choices.length > 4 ||
          (node.ending === true ? node.choices.length !== 0 : node.choices.length === 0)) {
        fail(label + ": an ending needs zero choices; other scenes need 1–4 choices."); return;
      }
      const choiceIds = new Set();
      node.choices.forEach(choice => {
        if (!object(choice)) { fail(label + ": each choice must be an object."); return; }
        keys(choice, ["id", "text", "nextNodeId", "effects"], label + " choice");
        if (!id(choice.id) || choiceIds.has(choice.id)) fail(label + ": choice IDs must be valid and unique within the scene.");
        choiceIds.add(choice.id);
        if (!text(choice.text, 300) || !id(choice.nextNodeId)) fail(label + ": each choice needs text and a valid nextNodeId.");
        if (!Array.isArray(choice.effects) || choice.effects.length > 8) {
          fail(label + ": effects must be an array of at most 8 entries."); return;
        }
        choice.effects.forEach(effect => {
          if (!object(effect) || effect.type !== "setFlag" || !id(effect.flag) || typeof effect.value !== "boolean") {
            fail(label + ": only setFlag effects with boolean values are supported."); return;
          }
          keys(effect, ["type", "flag", "value"], label + " effect");
          flags.add(effect.flag);
        });
      });
    });
    if (flags.size > 32) fail("A story may use at most 32 flags.");
    conditions.forEach(flag => { if (!flags.has(flag)) fail("Condition uses a flag never set by any choice: " + flag + "."); });
    if (!nodeMap[config.startNodeId]) fail("The starting scene does not exist.");
    if (config.whaleEncounterNodeId !== undefined && !nodeMap[config.whaleEncounterNodeId]) fail("The configured whale scene does not exist.");
    // Stop before graph traversal if malformed arrays or choices were found.
    if (errors.length) return result();
    config.nodes.forEach(node => node.choices.forEach(choice => {
      if (!nodeMap[choice.nextNodeId]) fail("Choice " + choice.id + " points to missing scene “" + choice.nextNodeId + "”.");
    }));
    if (config.nodes.filter(node => node.ending === true).length < 2) fail("Include at least two ending scenes.");
    if (errors.length) return result();

    // Memoized graph analysis bounds the work even when many paths merge.
    const visiting = new Set();
    const reached = new Set();
    const memo = new Map();
    function walk(nodeId) {
      if (visiting.has(nodeId)) { fail("Scene links contain a loop at “" + nodeId + "”."); return null; }
      if (memo.has(nodeId)) return memo.get(nodeId);
      reached.add(nodeId);
      visiting.add(nodeId);
      const node = nodeMap[nodeId];
      let stats;
      if (node.ending) stats = { min: 1, max: 1, decisions: 0 };
      else {
        const children = node.choices.map(choice => walk(choice.nextNodeId));
        stats = children.some(child => !child) ? null : {
          min: 1 + Math.min(...children.map(child => child.min)),
          max: 1 + Math.max(...children.map(child => child.max)),
          decisions: (node.choices.length > 1 ? 1 : 0) + Math.min(...children.map(child => child.decisions))
        };
      }
      visiting.delete(nodeId);
      memo.set(nodeId, stats);
      return stats;
    }
    const stats = walk(config.startNodeId);
    if (reached.size !== config.nodes.length) fail("Every scene, including every ending, must be reachable from the start.");
    if (stats) {
      if (stats.min < 5 || stats.max > 7) fail("Every playthrough must contain 5–7 scenes, including its ending.");
      if (stats.max !== config.sceneCount) fail("sceneCount does not match the longest path through the story.");
      if (stats.decisions < 2) fail("Every playthrough needs at least two scenes with multiple choices.");
    }
    return Object.assign(result(), { minScenes: stats && stats.min, maxScenes: stats && stats.max });
  }

  function parse(source) {
    if (typeof source !== "string" || new TextEncoder().encode(source).length > MAX_BYTES) {
      return { ok: false, errors: ["Choose a JSON story file smaller than 200 KB."] };
    }
    let config;
    try { config = JSON.parse(source.replace(/^\uFEFF/, "")); }
    catch (error) { return { ok: false, errors: ["This file is not valid JSON. Check commas, quotation marks, and brackets."] }; }
    const result = validate(config);
    return Object.assign(result, { config: result.ok ? config : null });
  }
  const api = Object.freeze({ validate, parse, assets: ASSETS, maxBytes: MAX_BYTES });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BespokeStoryFormat = api;
})(typeof window !== "undefined" ? window : globalThis);
