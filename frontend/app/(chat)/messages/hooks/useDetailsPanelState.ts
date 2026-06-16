import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chat-details-panel-open';

export function useDetailsPanelState() {
  const [isOpen, setIsOpen] = useState(() => {
    // Load initial state từ localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    }
    return false;
  });

  // Save state vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isOpen));
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
}