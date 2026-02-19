"use client";

import { useCallback } from "react";
import { SwipeCard } from "./SwipeCard";
import type { Gadget, SwipeDirection } from "@/types";

interface SwipeStackProps {
  gadgets: Gadget[];
  currentIndex: number;
  onSwipe: (gadgetId: string, direction: SwipeDirection) => void;
}

export function SwipeStack({ gadgets, currentIndex, onSwipe }: SwipeStackProps) {
  const visibleCards = gadgets.slice(currentIndex, currentIndex + 3);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const gadget = gadgets[currentIndex];
      if (gadget) {
        onSwipe(gadget.id, direction);
      }
    },
    [gadgets, currentIndex, onSwipe]
  );

  if (visibleCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-xl font-semibold text-text-primary">
          No more gadgets!
        </p>
        <p className="text-text-secondary text-center max-w-xs text-sm">
          You&apos;ve seen all available gadgets. Check back later for new
          discoveries.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[360px] mx-auto aspect-[3/4]">
      {visibleCards.map((gadget, index) => (
        <SwipeCard
          key={gadget.id}
          gadget={gadget}
          onSwipe={handleSwipe}
          isTop={index === 0}
          stackIndex={index}
        />
      ))}
    </div>
  );
}
