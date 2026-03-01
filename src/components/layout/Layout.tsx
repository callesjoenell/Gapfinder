import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Id } from "../../../convex/_generated/dataModel";

interface LayoutProps {
  children: ReactNode;
  currentSessionId: Id<"sessions"> | null;
  onSelectSession: (sessionId: Id<"sessions">) => void;
  onNewSession: (path: "exploration" | "evaluation") => void;
}

// DEBUG: Full layout hierarchy debug mode
const LAYOUT_DEBUG = false;

function useDebugLog(label: string, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!LAYOUT_DEBUG || !ref.current) return;
    const el = ref.current;
    const computed = window.getComputedStyle(el);
    console.log(
      `[DEBUG ${label}] offsetH=${el.offsetHeight} clientH=${el.clientHeight} scrollH=${el.scrollHeight}`,
      `| display=${computed.display}`,
      `| overflow=${computed.overflow}/${computed.overflowX}/${computed.overflowY}`,
      `| flex=${computed.flex} flexDir=${computed.flexDirection} flexShrink=${computed.flexShrink} flexGrow=${computed.flexGrow}`,
      `| height=${computed.height} maxH=${computed.maxHeight} minH=${computed.minHeight}`,
    );
  });
}

export function Layout({
  children,
  currentSessionId,
  onSelectSession,
  onNewSession,
}: LayoutProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useDebugLog("LAYOUT-OUTER", outerRef);
  useDebugLog("LAYOUT-INNER", innerRef);
  useDebugLog("LAYOUT-MAIN", mainRef);

  return (
    <div
      ref={outerRef}
      className="flex h-screen bg-gray-50"
      style={LAYOUT_DEBUG ? { outline: "4px solid cyan" } : undefined}
    >
      {LAYOUT_DEBUG && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "cyan",
            color: "black",
            fontSize: 10,
            fontFamily: "monospace",
            padding: "1px 4px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          LAYOUT-OUTER
        </span>
      )}
      <Sidebar
        currentSessionId={currentSessionId}
        onSelectSession={onSelectSession}
        onNewSession={onNewSession}
      />
      <div
        ref={innerRef}
        className="flex-1 flex flex-col overflow-hidden"
        style={LAYOUT_DEBUG ? { outline: "4px solid teal", position: "relative" } : undefined}
      >
        {LAYOUT_DEBUG && (
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              background: "teal",
              color: "white",
              fontSize: 10,
              fontFamily: "monospace",
              padding: "1px 4px",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            LAYOUT-INNER
          </span>
        )}
        <Header sessionId={currentSessionId} />
        <main
          ref={mainRef}
          className="flex-1 overflow-hidden"
          style={LAYOUT_DEBUG ? { outline: "4px solid magenta", position: "relative" } : undefined}
        >
          {LAYOUT_DEBUG && (
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                background: "magenta",
                color: "white",
                fontSize: 10,
                fontFamily: "monospace",
                padding: "1px 4px",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              LAYOUT-MAIN
            </span>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
