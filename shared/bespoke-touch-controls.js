// Touch buttons feed the same action names as keyboard controls, never fake keys.
(function (root) {
  function createTouchControls(container, bindings, allowedMechanics, canPlay) {
    const held = new Map();
    const pressed = new Set();
    const buttons = [];
    function clear() {
      held.clear();
      pressed.clear();
      buttons.forEach(function (button) { button.setAttribute("aria-pressed", "false"); });
    }
    function release(event) {
      const action = held.get(event.pointerId);
      held.delete(event.pointerId);
      if (event.type === "lostpointercapture" && action) pressed.delete(action);
      buttons.forEach(function (button) {
        if (button.dataset.action === action) {
          button.setAttribute("aria-pressed", String(Array.from(held.values()).includes(action)));
        }
      });
    }
    Object.entries(bindings).forEach(function ([action, binding]) {
      if (!allowedMechanics.includes(binding.mechanic)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = binding.action;
      button.dataset.action = action;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("pointerdown", function (event) {
        if (event.button !== 0 || !canPlay()) return;
        event.preventDefault();
        held.set(event.pointerId, action);
        pressed.add(action);
        button.setAttribute("aria-pressed", "true");
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", clear);
      button.addEventListener("lostpointercapture", release);
      // Hold Enter/Space on a focused button just like holding a finger.
      // Stop Space reaching Phaser's global Jump binding when activating Fire.
      button.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        if (event.repeat || !canPlay()) return;
        held.set("keyboard:" + action, action);
        pressed.add(action);
        button.setAttribute("aria-pressed", "true");
      });
      button.addEventListener("keyup", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        release({ pointerId: "keyboard:" + action });
      });
      button.addEventListener("blur", clear);
      // Assistive technology can activate an action without pointer/key events.
      button.addEventListener("click", function (event) {
        if (event.detail === 0 && canPlay()) pressed.add(action);
      });
      buttons.push(button);
      container.appendChild(button);
    });
    window.addEventListener("blur", clear);
    window.addEventListener("pagehide", clear);
    document.addEventListener("visibilitychange", clear);
    return {
      clear: clear,
      isDown: function (action) {
        if (!canPlay()) { clear(); return false; }
        return Array.from(held.values()).includes(action);
      },
      justDown: function (action) {
        if (!canPlay()) { clear(); return false; }
        const result = pressed.has(action);
        pressed.delete(action);
        return result;
      }
    };
  }
  root.BespokeTouchControls = { create: createTouchControls };
})(typeof window !== "undefined" ? window : globalThis);
