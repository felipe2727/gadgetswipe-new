"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: string;
  href: string | null;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Discover", icon: "style", href: "/swipe" },
  { label: "Matches", icon: "favorite", href: null }, // resolved dynamically
  { label: "Profile", icon: "account_circle", href: "/login" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  useEffect(() => {
    setLastSessionId(localStorage.getItem("lastSessionId"));
  }, []);

  return (
    <nav className="sticky bottom-0 bg-surface-dark border-t border-white/5 pb-6 pt-2 px-4 z-20 w-full">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          let href: string;
          let isStub = false;

          if (item.label === "Matches") {
            href = lastSessionId ? `/results/${lastSessionId}` : "/swipe";
          } else if (item.href) {
            href = item.href;
          } else {
            href = "#";
            isStub = true;
          }

          const isActive =
            !isStub && pathname?.startsWith(href) && href !== "#";

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 group",
                isStub && "opacity-40 pointer-events-none"
              )}
              aria-label={item.label}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-slate-400 group-hover:text-primary"
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1, 'wght' 400" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-slate-400 group-hover:text-primary"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
