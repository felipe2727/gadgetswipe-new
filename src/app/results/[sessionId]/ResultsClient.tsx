"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@/components/results/Confetti";
import { ResultCard } from "@/components/results/ResultCard";
import { BottomNav } from "@/components/BottomNav";
import type { Gadget, ScoredGadget } from "@/types";

interface ResultsClientProps {
  topGadgets: ScoredGadget[];
  gadgets: Gadget[];
  sessionId: string;
}

export function ResultsClient({
  topGadgets,
  gadgets,
  sessionId,
}: ResultsClientProps) {
  // Persist sessionId for BottomNav "Matches" link
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("lastSessionId", sessionId);
    }
  }, [sessionId]);

  const handleDealClick = async (gadgetId: string) => {
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "deal_click",
          session_id: sessionId,
          gadget_id: gadgetId,
        }),
      });
    } catch {
      // Non-critical
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--color-bg-primary": "#102217",
          "--color-surface-dark": "#183423",
          "--color-bg-card": "#14281c",
          backgroundColor: "#102217",
        } as React.CSSProperties
      }
    >
      <Confetti />

      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md border-b border-primary/10 px-4 pt-6 pb-4"
        style={{ backgroundColor: "rgba(16, 34, 23, 0.95)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/swipe"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-dark text-primary transition-colors hover:bg-primary hover:text-primary-content"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex-1 text-center pr-10">
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
              Results
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white leading-tight">
            Top 3 Matches
          </h1>
          <p className="text-slate-400 text-sm">
            Based on your last 20 swipes, these gadgets fit your vibe.
          </p>
        </div>
      </header>

      {/* Cards list */}
      <main className="flex-1 px-4 py-6 flex flex-col gap-5 overflow-y-auto">
        {topGadgets.map((scored, index) => {
          const gadget = gadgets.find((g) => g.id === scored.gadget_id);
          if (!gadget) return null;
          return (
            <ResultCard
              key={scored.gadget_id}
              gadget={gadget}
              score={scored}
              index={index}
              onDealClick={handleDealClick}
            />
          );
        })}

        {/* Keep Swiping CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex flex-col gap-3 pb-8"
        >
          <Link
            href="/swipe"
            className="w-full bg-surface-dark border border-primary/30 text-primary py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Keep Swiping
          </Link>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
