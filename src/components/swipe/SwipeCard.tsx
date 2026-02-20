"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import type { Gadget, SwipeDirection } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { SwipeOverlay } from "./SwipeOverlay";

const SWIPE_THRESHOLD = 120;
const SUPER_THRESHOLD = -100;

const SOURCE_DISPLAY: Record<string, string> = {
  reddit: "Reddit",
  amazon: "Amazon",
  gadgetflow: "GadgetFlow",
  producthunt: "Product Hunt",
  uncrate: "Uncrate",
  blessthisstuff: "BlessThisStuff",
  awesomestuff: "AwesomeStuff",
  dudeiwantthat: "DudeIWantThat",
  coolthings: "CoolThings",
  gearpatrol: "Gear Patrol",
  yankodesign: "Yanko Design",
  rakunew: "Rakunew",
};

interface SwipeCardProps {
  gadget: Gadget;
  onSwipe: (direction: SwipeDirection) => void;
  isTop: boolean;
  stackIndex: number;
}

export function SwipeCard({
  gadget,
  onSwipe,
  isTop,
  stackIndex,
}: SwipeCardProps) {
  const [imgError, setImgError] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-300, 300], [-15, 15]);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;

    if (offsetY < SUPER_THRESHOLD && Math.abs(offsetX) < 100) {
      await controls.start({
        y: -800,
        scale: 0.8,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      });
      onSwipe("super");
      return;
    }

    if (offsetX > SWIPE_THRESHOLD) {
      await controls.start({
        x: 500,
        rotate: 30,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      });
      onSwipe("right");
      return;
    }

    if (offsetX < -SWIPE_THRESHOLD) {
      await controls.start({
        x: -500,
        rotate: -30,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      });
      onSwipe("left");
      return;
    }

    controls.start({
      x: 0,
      y: 0,
      rotate: 0,
      transition: { type: "spring", stiffness: 600, damping: 30 },
    });
  };

  const triggerSwipe = async (direction: SwipeDirection) => {
    if (direction === "right") {
      await controls.start({
        x: 500,
        rotate: 30,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      });
    } else if (direction === "left") {
      await controls.start({
        x: -500,
        rotate: -30,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      });
    } else {
      await controls.start({
        y: -800,
        scale: 0.8,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      });
    }
    onSwipe(direction);
  };

  const specTags = (
    gadget.ai_tags?.length ? gadget.ai_tags : gadget.tags
  ).slice(0, 4);

  const categoryLabel =
    SOURCE_DISPLAY[gadget.source_site] ?? gadget.source_site;

  const priceLabel =
    gadget.price_cents !== null
      ? formatPrice(gadget.price_cents, gadget.currency)
      : null;

  return (
    <motion.div
      className="absolute w-full cursor-grab active:cursor-grabbing select-none"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        scale: 1 - stackIndex * 0.05,
        translateY: stackIndex * 12,
        zIndex: 10 - stackIndex,
        aspectRatio: "3/4",
        maxWidth: "360px",
        width: "100%",
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={controls}
      data-trigger-swipe={isTop ? "true" : undefined}
      ref={(el) => {
        if (el && isTop) {
          (
            el as HTMLDivElement & {
              triggerSwipe?: typeof triggerSwipe;
            }
          ).triggerSwipe = triggerSwipe;
        }
      }}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden border select-none",
          isTop
            ? "bg-surface-dark border-white/10"
            : "bg-surface-dark border-white/5 shadow-2xl"
        )}
        style={isTop ? { boxShadow: "var(--shadow-glass)" } : undefined}
      >
        {/* LIKE/NOPE overlay */}
        {isTop && <SwipeOverlay x={x} />}

        {/* Hero Image — top 65% */}
        <div className="relative h-[65%] w-full overflow-hidden">
          {imgError ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary, #00e87b) 0%, #0A0A0F 70%)",
              }}
            >
              <span className="material-symbols-outlined text-white/20 text-6xl mb-3">
                devices
              </span>
              <span className="text-white/60 text-base font-semibold line-clamp-2 leading-tight">
                {gadget.title}
              </span>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={gadget.image_url}
              alt={gadget.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth < 200 || img.naturalHeight < 200) {
                  setImgError(true);
                }
              }}
              draggable={false}
            />
          )}

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10 backdrop-blur-md bg-black/40 border border-white/20 px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              {categoryLabel}
            </span>
          </div>

          {/* Subtle gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Glass info panel — bottom 35% */}
        <div className="absolute bottom-0 w-full h-[35%] glass-panel p-5 flex flex-col justify-between">
          <div>
            {/* Name + price row */}
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white leading-tight tracking-tight pr-2 line-clamp-1">
                {gadget.title}
              </h2>
              {priceLabel && (
                <span
                  className="shrink-0 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-bold"
                  style={{ boxShadow: "var(--shadow-neon)" }}
                >
                  {priceLabel}
                </span>
              )}
            </div>
            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed font-light line-clamp-2">
              {gadget.ai_description ?? gadget.description ?? ""}
            </p>
          </div>

          {/* Spec tags row */}
          {specTags.length > 0 && (
            <div className="flex gap-2 mt-auto overflow-x-auto no-scrollbar pb-1 pt-1">
              {specTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    label
                  </span>
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
