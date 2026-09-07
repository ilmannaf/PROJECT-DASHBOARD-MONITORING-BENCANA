import { useEffect, useCallback, useRef } from 'react';

/**
 * Helper: cek apakah user sedang mengetik di input field
 */
function isTyping() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    el.isContentEditable
  );
}

/**
 * Hook untuk mendaftarkan keyboard shortcuts global.
 *
 * @param {Array<{ key: string, ctrl?: boolean, shift?: boolean, alt?: boolean, action: () => void, allowWhenTyping?: boolean }>} shortcuts
 */
export default function useKeyboardShortcuts(shortcuts) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e) => {
    for (const shortcut of shortcutsRef.current) {
      const {
        key,
        ctrl = false,
        shift = false,
        alt = false,
        action,
        allowWhenTyping = false,
      } = shortcut;

      // Skip jika user sedang mengetik (kecuali shortcut itu explicitly allowWhenTyping)
      if (!allowWhenTyping && isTyping()) continue;

      // Cek key match
      const keyMatch =
        e.key.toLowerCase() === key.toLowerCase() ||
        e.key === key;

      // Cek modifier match
      const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
      const altMatch = alt ? e.altKey : !e.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        e.stopPropagation();
        action();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
