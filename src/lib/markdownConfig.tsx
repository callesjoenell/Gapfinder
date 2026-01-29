import type { Components } from "react-markdown";

/**
 * Markdown component configuration for chat messages.
 * Supports: bold, italic, lists
 * Disabled: headers (h1-h6) - rendered as paragraphs
 */
export const markdownComponents: Components = {
  // Disable headers - render as paragraphs
  h1: "p",
  h2: "p",
  h3: "p",
  h4: "p",
  h5: "p",
  h6: "p",

  // Style text formatting
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,

  // Style lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
  ),
  li: ({ children }) => <li className="ml-2">{children}</li>,

  // Paragraphs with spacing
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,

  // Code styling (inline only, no code blocks for now)
  code: ({ children }) => (
    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
};
