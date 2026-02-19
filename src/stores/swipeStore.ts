"use client";

import { create } from "zustand";
import type { Gadget, SwipeDirection } from "@/types";

interface SwipeHistoryEntry {
  gadgetId: string;
  direction: SwipeDirection;
  durationMs: number;
}

interface SwipeState {
  sessionId: string | null;
  gadgets: Gadget[];
  currentIndex: number;
  swipeHistory: SwipeHistoryEntry[];
  isComplete: boolean;
  cardStartTime: number | null;

  setSession: (id: string, gadgets: Gadget[]) => void;
  recordSwipe: (gadgetId: string, direction: SwipeDirection) => void;
  startCardTimer: () => void;
  getCurrentDuration: () => number;
  reset: () => void;
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  sessionId: null,
  gadgets: [],
  currentIndex: 0,
  swipeHistory: [],
  isComplete: false,
  cardStartTime: null,

  setSession: (id, gadgets) =>
    set({
      sessionId: id,
      gadgets,
      currentIndex: 0,
      swipeHistory: [],
      isComplete: false,
      cardStartTime: Date.now(),
    }),

  recordSwipe: (gadgetId, direction) => {
    const state = get();
    const durationMs = state.cardStartTime
      ? Date.now() - state.cardStartTime
      : 0;

    const newHistory = [
      ...state.swipeHistory,
      { gadgetId, direction, durationMs },
    ];
    const newIndex = state.currentIndex + 1;
    const totalCards = state.gadgets.length;
    const isComplete = newIndex >= Math.min(20, totalCards);

    set({
      swipeHistory: newHistory,
      currentIndex: newIndex,
      isComplete,
      cardStartTime: isComplete ? null : Date.now(),
    });
  },

  startCardTimer: () => set({ cardStartTime: Date.now() }),

  getCurrentDuration: () => {
    const state = get();
    return state.cardStartTime ? Date.now() - state.cardStartTime : 0;
  },

  reset: () =>
    set({
      sessionId: null,
      gadgets: [],
      currentIndex: 0,
      swipeHistory: [],
      isComplete: false,
      cardStartTime: null,
    }),
}));
