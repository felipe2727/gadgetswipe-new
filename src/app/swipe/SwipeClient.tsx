"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSwipeStore } from "@/stores/swipeStore";
import { SwipeStack } from "@/components/swipe/SwipeStack";
import { SwipeActions } from "@/components/swipe/SwipeActions";
import { SwipeHeader } from "@/components/swipe/SwipeHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { BottomNav } from "@/components/BottomNav";
import type { Gadget, SwipeDirection } from "@/types";

interface SwipeClientProps {
  initialGadgets: Gadget[];
}

export function SwipeClient({ initialGadgets }: SwipeClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const {
    sessionId,
    gadgets,
    currentIndex,
    isComplete,
    setSession,
    recordSwipe,
    getCurrentDuration,
  } = useSwipeStore();

  // Initialize session
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total_cards: 20 }),
        });
        const session = await res.json();
        setSession(session.id, initialGadgets);
      } catch (error) {
        console.error("Failed to create session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [initialGadgets, setSession]);

  // Handle session completion
  useEffect(() => {
    if (!isComplete || !sessionId) return;

    async function computeResults() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/results`, {
          method: "POST",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error("Scoring API error:", res.status, body);
          return;
        }
        router.push(`/results/${sessionId}`);
      } catch (error) {
        console.error("Failed to compute results:", error);
      }
    }

    computeResults();
  }, [isComplete, sessionId, router]);

  const handleSwipe = useCallback(
    async (gadgetId: string, direction: SwipeDirection) => {
      const durationMs = getCurrentDuration();
      recordSwipe(gadgetId, direction);

      try {
        await fetch("/api/swipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            gadget_id: gadgetId,
            direction,
            swipe_duration_ms: durationMs,
          }),
        });
      } catch (error) {
        console.error("Failed to record swipe:", error);
      }
    },
    [sessionId, recordSwipe, getCurrentDuration]
  );

  // Programmatic swipe from action buttons
  const handleAction = useCallback(
    (direction: SwipeDirection) => {
      const topCard = document.querySelector(
        '[data-trigger-swipe="true"]'
      ) as
        | (HTMLDivElement & { triggerSwipe?: (d: SwipeDirection) => void })
        | null;

      if (topCard?.triggerSwipe) {
        topCard.triggerSwipe(direction);
      } else {
        const gadget = gadgets[currentIndex];
        if (gadget) handleSwipe(gadget.id, direction);
      }
    },
    [gadgets, currentIndex, handleSwipe]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-slate-400 font-medium">Loading gadgets...</p>
        </div>
      </div>
    );
  }

  const totalCards = Math.min(20, gadgets.length);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary relative">
      <SwipeHeader />
      <ProgressBar current={currentIndex} total={totalCards} />

      {/* Card stack */}
      <main className="flex-1 relative flex items-center justify-center w-full max-w-md mx-auto px-4">
        <SwipeStack
          gadgets={gadgets}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
        />
      </main>

      {/* Action buttons */}
      <SwipeActions
        onAction={handleAction}
        disabled={gadgets.slice(currentIndex, currentIndex + 1).length === 0}
      />

      <BottomNav />
    </div>
  );
}
