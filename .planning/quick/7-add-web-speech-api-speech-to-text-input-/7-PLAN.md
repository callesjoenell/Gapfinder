---
phase: quick-7
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/MessageInput.tsx
  - src/hooks/useSpeechToText.ts
autonomous: true
requirements: [QUICK-7]
must_haves:
  truths:
    - "User sees a teal microphone button next to the Send button"
    - "User can click mic to start speech recognition and see spoken words appear in textarea"
    - "Placeholder text reads 'Type here or click the mic to talk' in grey"
    - "Mic button shows active/listening state while recording"
    - "Speech recognition stops and finalizes when user clicks mic again or stops talking"
  artifacts:
    - path: "src/hooks/useSpeechToText.ts"
      provides: "Web Speech API hook with start/stop/transcript state"
      exports: ["useSpeechToText"]
    - path: "src/components/MessageInput.tsx"
      provides: "Updated input with mic button and new placeholder"
  key_links:
    - from: "src/components/MessageInput.tsx"
      to: "src/hooks/useSpeechToText.ts"
      via: "useSpeechToText hook import"
      pattern: "useSpeechToText"
---

<objective>
Add speech-to-text input to the chat message input using the Web Speech API.

Purpose: Let users dictate messages by clicking a microphone button, making the app more accessible and convenient on mobile.
Output: A `useSpeechToText` hook and an updated `MessageInput` component with mic button.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/MessageInput.tsx
@tailwind.config.js

<interfaces>
From src/components/MessageInput.tsx:
```typescript
interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
  draftMessage?: string;
  onDraftChange?: (draft: string) => void;
  onSendSuccess?: () => void;
  sessionId?: Id<"sessions">;
  debugWrapRef?: React.MutableRefObject<HTMLElement | null>;
}
```

Tailwind primary color is teal: primary-500 = #00D5BE
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create useSpeechToText hook</name>
  <files>src/hooks/useSpeechToText.ts</files>
  <action>
Create a React hook `useSpeechToText` that wraps the Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`).

Hook signature:
```typescript
interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;       // accumulated transcript text
  start: () => void;
  stop: () => void;
  toggle: () => void;
  resetTranscript: () => void;
}
export function useSpeechToText(options?: { lang?: string; continuous?: boolean }): UseSpeechToTextReturn;
```

Implementation details:
- Default `lang` to `"en-US"`, `continuous` to `true`, `interimResults` to `true`.
- On `onresult`: accumulate final results into `transcript` state. Show interim results appended to final text so user sees words appearing in real-time.
- On `onend`: if `isListening` is still true and continuous mode, restart recognition (Chrome stops after silence). Use a ref to track intentional stop vs auto-stop.
- On `onerror`: if error is "not-allowed" or "no-speech", stop gracefully. Log others to console.
- `isSupported`: check `typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)`.
- Clean up recognition instance on unmount via useEffect return.
- Use `useRef` for the recognition instance to avoid re-creation on renders.
  </action>
  <verify>
    <automated>npx tsc --noEmit src/hooks/useSpeechToText.ts 2>&1 | head -20</automated>
  </verify>
  <done>Hook file exists, exports useSpeechToText, compiles without type errors</done>
</task>

<task type="auto">
  <name>Task 2: Add mic button to MessageInput with new placeholder</name>
  <files>src/components/MessageInput.tsx</files>
  <action>
Modify MessageInput.tsx:

1. **Change default placeholder** from `"Type a message..."` to `"Type here or click the mic to talk"`. The placeholder text should be grey (already handled by default browser/Tailwind styling on placeholder — verify `placeholder:text-gray-400` is applied or add it).

2. **Import and use the hook:**
   ```typescript
   import { useSpeechToText } from "../hooks/useSpeechToText";
   ```
   Call `const { isListening, isSupported, transcript, toggle, resetTranscript } = useSpeechToText();`

3. **Sync transcript into content:** Add a `useEffect` that watches `transcript`. When transcript changes and is non-empty, append it to current content (or replace if content was empty). Call `onDraftChange` with the new value. Be careful: when user is also typing, append transcript after existing typed text with a space separator.

   Strategy: track what portion of content came from speech via a ref `lastTranscriptRef`. When transcript updates, replace the old transcript portion at the end of content with the new transcript. On `resetTranscript`, clear the ref.

4. **Add mic button** between the textarea and Send button. Layout: `textarea | mic button | send button` in the existing flex row.

   Button markup:
   ```tsx
   {isSupported && (
     <button
       type="button"
       onClick={() => {
         toggle();
         if (!isListening) resetTranscript();
       }}
       disabled={disabled}
       className={`rounded-xl p-3 transition-colors shrink-0 ${
         isListening
           ? "bg-red-500 text-white animate-pulse"
           : "bg-primary-500 text-white hover:bg-primary-600"
       } disabled:opacity-50 disabled:cursor-not-allowed`}
       aria-label={isListening ? "Stop recording" : "Start recording"}
     >
       {/* Mic SVG icon - heroicons microphone */}
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
         <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
         <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
       </svg>
     </button>
   )}
   ```

5. **When listening, update helper text:** Change the "Press Enter to send" text to show "Listening... Click mic to stop" when `isListening` is true. Use red-400 text color for this state.

6. **When user submits (handleSubmit):** Also call `resetTranscript()` and stop listening if active. Reset the `lastTranscriptRef`.

7. **Add `placeholder:text-gray-400`** to the textarea className if not already producing grey placeholder text.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>Mic button appears in teal next to Send, placeholder reads "Type here or click the mic to talk" in grey, clicking mic starts speech recognition and words appear in textarea, clicking again stops it, button pulses red while listening</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- Visual check: mic button visible in teal, placeholder text is grey and correct
- Functional check: clicking mic starts recognition, speech appears in textarea
</verification>

<success_criteria>
- Teal microphone button renders between textarea and Send button
- Placeholder text is "Type here or click the mic to talk" in grey
- Clicking mic activates Web Speech API, spoken words stream into textarea
- Clicking mic again (or silence timeout) stops recognition
- Button shows red pulsing state while listening
- Graceful fallback: mic button hidden if browser does not support Web Speech API
- Existing keyboard input and send functionality unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/7-add-web-speech-api-speech-to-text-input-/7-SUMMARY.md`
</output>
