"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Gadget, ScoredGadget } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

interface ResultCardProps {
  gadget: Gadget;
  score: ScoredGadget;
  index: number;
  onDealClick: (gadgetId: string) => void;
}

const MAX_SCORE = 4.3;

export function ResultCard({
  gadget,
  score,
  index,
  onDealClick,
}: ResultCardProps) {
  const [imgError, setImgError] = useState(false);
  const isTopPick = score.rank === 1;
  const matchPercent = Math.min(Math.round((score.score / MAX_SCORE) * 100), 99);

  const priceLabel =
    gadget.price_cents !== null
      ? formatPrice(gadget.price_cents, gadget.currency)
      : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.15,
        duration: 0.5,
        ease: "easeOut",
      }}
      className={cn(
        "group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-lg border transition-all duration-300 w-full",
        isTopPick
          ? "bg-surface-dark border-primary/20 hover:border-primary/50"
          : "bg-surface-dark border-white/5 hover:border-primary/30"
      )}
    >
      {/* TOP PICK badge */}
      {isTopPick && (
        <div className="absolute -top-3 left-4 bg-primary text-primary-content text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">stars</span>
          Top Pick
        </div>
      )}

      {/* Image */}
      <div
        className={cn(
          "shrink-0 rounded-lg overflow-hidden bg-black/20 relative",
          isTopPick
            ? "w-full sm:w-32 h-40 sm:h-auto"
            : "w-full sm:w-28 h-40 sm:h-auto"
        )}
      >
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-dark">
            <span className="text-slate-500 text-xs">No image</span>
          </div>
        ) : (
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
            <Image
              src={gadget.image_url}
              alt={gadget.title}
              fill
              className="object-cover"
              sizes={isTopPick ? "128px" : "112px"}
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 gap-3">
        <div>
          <div className="flex justify-between items-start">
            <h3
              className={cn(
                "font-bold text-white leading-tight mb-1",
                isTopPick ? "text-xl" : "text-lg"
              )}
            >
              {gadget.title}
            </h3>
            {/* Match % */}
            <div className="flex flex-col items-end shrink-0 ml-2">
              <span
                className={cn(
                  "font-bold",
                  isTopPick
                    ? "text-primary text-lg"
                    : "text-primary/90 text-base"
                )}
              >
                {matchPercent}%
              </span>
              <span className="text-[10px] text-primary/70 uppercase font-medium tracking-wide">
                Match
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-sm line-clamp-2">
            {gadget.ai_description ?? gadget.description ?? ""}
          </p>
        </div>

        {/* Price + View Deal footer */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
          {priceLabel && (
            <span className="text-white font-medium">{priceLabel}</span>
          )}
          <a
            href={gadget.affiliate_url ?? gadget.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDealClick(gadget.id)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-colors",
              isTopPick
                ? "bg-primary text-primary-content hover:bg-white hover:text-primary-content"
                : "bg-white/10 text-white hover:bg-primary hover:text-primary-content"
            )}
          >
            View Deal
            <span className="material-symbols-outlined text-[18px]">
              arrow_outward
            </span>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
