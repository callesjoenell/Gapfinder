---
phase: quick-7
plan: 1
subsystem: UI / Input
tags: [speech-to-text, web-speech-api, accessibility, mobile, UX]
dependency_graph:
  requires: []
  provides: [useSpeechToText hook, mic button in MessageInput]
  affects: [src/components/MessageInput.tsx]
tech_stack:
  added: [Web Speech API (browser-native)]
  patterns: [custom hook wrapping browser API, incremental transcript merging with ref]
key_files:
  created:
    - src/hooks/useSpeechToText.ts
  modified:
    - src/components/MessageInput.tsx
decisions:
  - Use `lastTranscriptRef` to track injected speech portion so typed prefix is preserved during mic input
  - Auto-restart recognition on `onend` (Chrome silently stops after silence) unless `intentionalStopRef` is set
  - `isSupported` check hides mic button entirely on unsupported browsers (graceful fallback)
metrics:
  duration: ~10 minutes
  completed_date: "2026-03-03T12:35:03Z"
  tasks_completed: 2
  files_changed: 2
---

# Quick Task 7: Add Web Speech API Speech-to-Text Input — Summary

**One-liner:** Web Speech API hook with auto-restart + incremental transcript merging injected into MessageInput as a teal mic button.

---

## What Was Built

### `src/hooks/useSpeechToText.ts`

A React hook wrapping `SpeechRecognition` / `webkitSpeechRecognition`:

- Returns `{ isListening, isSupported, transcript, start, stop, toggle, resetTranscript }`.
- Accumulates **final** results in `finalTextRef` across restart cycles; shows **interim** results appended in real-time.
- Auto-restarts on `onend` when not intentionally stopped (handles Chrome's silence cutoff behaviour).
- Graceful error handling: stops on `not-allowed` / `no-speech`; logs others to console.
- Cleans up recognition instance on unmount.

### `src/components/MessageInput.tsx`

- **Default placeholder** changed to `"Type here or click the mic to talk"` with `placeholder:text-gray-400`.
- **Mic button** rendered between textarea and Send (hidden when `isSupported` is false).
  - Teal (`bg-primary-500`) at rest; red + `animate-pulse` while listening.
  - `aria-label` toggles between "Start recording" / "Stop recording".
- **Transcript sync effect**: watches `transcript`, replaces the previously injected speech portion at end of content using `lastTranscriptRef`, preserving any typed prefix. Notifies `onDraftChange`.
- Manual typing resets `lastTranscriptRef` so speech and typing co-exist cleanly.
- **Helper text** shows "Listening... Click mic to stop" in `text-red-400` while active.
- `handleSubmit` calls `resetTranscript()` and clears `lastTranscriptRef`.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Self-Check

- [x] `src/hooks/useSpeechToText.ts` — exists
- [x] `src/components/MessageInput.tsx` — modified
- [x] `npx tsc --noEmit` — passes with no errors
- [x] Commits: `c5c0067` (hook), `8d8919b` (MessageInput)

## Self-Check: PASSED
