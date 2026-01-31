import { useState, useRef, useEffect } from 'react';

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  isEditing: boolean;
  onEditStart?: () => void;
  onEditEnd: () => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function InlineEditableText({
  value,
  onSave,
  isEditing,
  onEditStart,
  onEditEnd,
  className = '',
  inputClassName = '',
  placeholder = 'Enter text...',
}: InlineEditableTextProps) {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus and select when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = editValue.trim();

    // Revert if empty
    if (!trimmed) {
      setEditValue(value);
      onEditEnd();
      return;
    }

    // Skip save if unchanged
    if (trimmed === value) {
      onEditEnd();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      onEditEnd();
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    onEditEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className={`${inputClassName} outline-none focus:ring-2 focus:ring-primary-500 rounded px-1 -mx-1 ${
          isSaving ? 'opacity-50' : ''
        }`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={onEditStart}
      className={`${className} cursor-pointer`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
}
