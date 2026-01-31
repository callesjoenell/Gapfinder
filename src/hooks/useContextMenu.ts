import { useState, useCallback, useEffect } from 'react';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  targetId: string | null;
}

export function useContextMenu<T extends string = string>() {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetId: null,
  });

  const open = useCallback((targetId: T, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      targetId,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      targetId: null,
    }));
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, close]);

  return {
    isOpen: state.isOpen,
    position: state.position,
    targetId: state.targetId as T | null,
    open,
    close,
  };
}
