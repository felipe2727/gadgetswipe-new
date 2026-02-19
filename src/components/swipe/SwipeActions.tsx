"use client";

import type { SwipeDirection } from "@/types";

interface SwipeActionsProps {
  onAction: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

export function SwipeActions({ onAction, disabled }: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-6 w-full px-8 pb-8 pt-4">
      {/* Reject */}
      <button
        onClick={() => onAction("left")}
        disabled={disabled}
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-surface-dark border border-white/10 shadow-lg transition-all active:scale-95 hover:border-accent-red/50 hover:bg-accent-red/10 disabled:opacity-50"
        aria-label="Pass"
      >
        <span
          className="material-symbols-outlined text-3xl text-accent-red transition-transform group-hover:-rotate-12"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 600" }}
        >
          close
        </span>
      </button>

      {/* Super Like */}
      <button
        onClick={() => onAction("super")}
        disabled={disabled}
        className="group flex items-center justify-center w-12 h-12 rounded-full bg-surface-dark border border-white/10 shadow-lg transition-all active:scale-95 hover:border-accent-gold/50 hover:bg-accent-gold/10 -mt-4 disabled:opacity-50"
        aria-label="Super like"
      >
        <span
          className="material-symbols-outlined text-2xl text-accent-gold transition-transform group-hover:scale-110"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          star
        </span>
      </button>

      {/* Like */}
      <button
        onClick={() => onAction("right")}
        disabled={disabled}
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-surface-dark border border-white/10 shadow-lg transition-all active:scale-95 hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50"
        aria-label="Like"
      >
        <span
          className="material-symbols-outlined text-3xl text-primary transition-transform group-hover:scale-110"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          favorite
        </span>
      </button>
    </div>
  );
}
