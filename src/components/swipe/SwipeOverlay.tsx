"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

interface SwipeOverlayProps {
  x: MotionValue<number>;
}

export function SwipeOverlay({ x }: SwipeOverlayProps) {
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  return (
    <>
      {/* LIKE overlay (green, right side) */}
      <motion.div
        className="absolute inset-0 z-10 flex items-start justify-start p-6 pointer-events-none rounded-2xl"
        style={{
          opacity: likeOpacity,
          background:
            "linear-gradient(135deg, rgba(13, 242, 105, 0.3) 0%, transparent 60%)",
        }}
      >
        <div className="border-4 border-primary rounded-lg px-4 py-1 rotate-[-20deg] mt-8">
          <span
            className="text-4xl font-black text-primary tracking-widest uppercase"
            style={{ textShadow: "0 0 10px rgba(13,242,105,0.4)" }}
          >
            LIKE
          </span>
        </div>
      </motion.div>

      {/* NOPE overlay (red, left side) */}
      <motion.div
        className="absolute inset-0 z-10 flex items-start justify-end p-6 pointer-events-none rounded-2xl"
        style={{
          opacity: nopeOpacity,
          background:
            "linear-gradient(225deg, rgba(255, 71, 87, 0.3) 0%, transparent 60%)",
        }}
      >
        <div className="border-4 border-accent-red rounded-lg px-4 py-1 rotate-[20deg] mt-8">
          <span className="text-4xl font-black text-accent-red tracking-widest uppercase">
            NOPE
          </span>
        </div>
      </motion.div>
    </>
  );
}
