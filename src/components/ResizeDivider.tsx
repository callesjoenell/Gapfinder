/**
 * ResizeDivider - A thin draggable horizontal bar between IdeaCard and the chat area
 */

interface ResizeDividerProps {
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

export function ResizeDivider({ isDragging, onPointerDown }: ResizeDividerProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`
        relative flex items-center justify-center h-2 cursor-row-resize select-none shrink-0
        ${isDragging ? 'bg-blue-200' : 'bg-gray-200 hover:bg-gray-300'}
        transition-colors
      `}
      style={{ touchAction: 'none' }}
    >
      {/* Visible grab pill */}
      <div
        className={`
          w-10 h-1 rounded-full
          ${isDragging ? 'bg-blue-400' : 'bg-gray-400'}
        `}
      />
    </div>
  );
}
