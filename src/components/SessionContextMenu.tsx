import { useEffect } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';

interface SessionContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  session: Doc<"sessions"> | null; // Full session object for isArchived, name, etc.
  onClose: () => void;
  onRename: () => void;
  onDeleted?: () => void;
}

export function SessionContextMenu({
  isOpen,
  position,
  session,
  onClose,
  onRename,
  onDeleted,
}: SessionContextMenuProps) {
  const archiveSession = useMutation(api.sessions.archiveSession);
  const unarchiveSession = useMutation(api.sessions.unarchiveSession);

  // Extract from session object
  const sessionId = session?._id ?? null;
  const isArchived = session?.isArchived ?? false;

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Update position when it changes
  useEffect(() => {
    if (refs.reference.current) {
      // Create a virtual element at the click position
      refs.setReference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: position.x,
            y: position.y,
            top: position.y,
            left: position.x,
            right: position.x,
            bottom: position.y,
          };
        },
      });
    }
  }, [position, refs]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const floating = refs.floating.current;
      if (floating && !floating.contains(e.target as Node)) {
        onClose();
      }
    };

    // Use mousedown for immediate response
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, refs.floating]);

  if (!isOpen || !sessionId) return null;

  const handleArchive = async () => {
    try {
      await archiveSession({ sessionId });
      onClose();
    } catch (error) {
      console.error('Failed to archive session:', error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveSession({ sessionId });
      onClose();
    } catch (error) {
      console.error('Failed to unarchive session:', error);
    }
  };

  const handleDelete = () => {
    // This will be replaced with modal confirmation in DeleteConfirmModal integration
    // For now, just close - actual delete happens via modal
    onDeleted?.();
  };

  const handleRename = () => {
    onRename();
    onClose();
  };

  return (
    <>
      {/* Backdrop for catching clicks */}
      <div className="fixed inset-0 z-40" />

      {/* Menu */}
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50"
      >
        <button
          onClick={handleRename}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Rename
        </button>

        {isArchived ? (
          <button
            onClick={handleUnarchive}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Unarchive
          </button>
        ) : (
          <button
            onClick={handleArchive}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
        )}

        <div className="border-t border-gray-200 my-1" />

        <button
          onClick={handleDelete}
          className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </>
  );
}
