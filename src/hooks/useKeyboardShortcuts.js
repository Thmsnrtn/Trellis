import { useEffect } from "react";

/**
 * Register global keyboard shortcuts.
 * @param {Object} shortcuts - Map of "mod+key" → handler
 * @param {boolean} enabled - Whether shortcuts are active
 *
 * Keys: "mod+k", "mod+l", "mod+enter", "escape"
 * "mod" = Cmd on Mac, Ctrl on Windows/Linux
 */
export function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e) {
      const isMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      for (const [combo, fn] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split("+");
        const needsMod = parts.includes("mod");
        const targetKey = parts[parts.length - 1];

        if (needsMod && !isMod) continue;
        if (!needsMod && isMod) continue;
        if (key !== targetKey) continue;

        // Don't intercept if user is typing in an input/textarea (unless escape)
        const tag = document.activeElement?.tagName;
        if (targetKey !== "escape" && (tag === "INPUT" || tag === "TEXTAREA")) continue;

        e.preventDefault();
        fn(e);
        return;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}
