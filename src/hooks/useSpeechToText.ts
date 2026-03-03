import { useState, useRef, useEffect, useCallback } from "react";

interface UseSpeechToTextOptions {
  lang?: string;
  continuous?: boolean;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  resetTranscript: () => void;
}

// Detect support once at module level
const isSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAny = any;

export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
  const { lang = "en-US", continuous = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognitionAny>(null);
  // intentionalStop: true means the user explicitly stopped, so don't restart on onend
  const intentionalStopRef = useRef(false);
  // Accumulate final results across restart cycles
  const finalTextRef = useRef("");

  const initRecognition = useCallback(() => {
    if (!isSupported) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor =
      (window as SpeechRecognitionAny).SpeechRecognition ||
      (window as SpeechRecognitionAny).webkitSpeechRecognition;

    const recognition: SpeechRecognitionAny = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionAny) => {
      let interimText = "";
      let newFinal = finalTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      finalTextRef.current = newFinal;
      setTranscript(newFinal + interimText);
    };

    recognition.onend = () => {
      // If we didn't stop intentionally and still want to listen, restart
      if (!intentionalStopRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started or another error — give up silently
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionAny) => {
      if (event.error === "not-allowed" || event.error === "no-speech") {
        intentionalStopRef.current = true;
        setIsListening(false);
      } else {
        console.error("[useSpeechToText] error:", event.error);
      }
    };

    return recognition;
  }, [lang, continuous]);

  const start = useCallback(() => {
    if (!isSupported) return;

    intentionalStopRef.current = false;

    // Create a new recognition instance if we don't have one
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {
      // Already running — treat as already listening
      setIsListening(true);
    }
  }, [initRecognition]);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  const resetTranscript = useCallback(() => {
    finalTextRef.current = "";
    setTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    start,
    stop,
    toggle,
    resetTranscript,
  };
}
