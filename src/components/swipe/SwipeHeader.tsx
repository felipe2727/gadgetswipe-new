"use client";

export function SwipeHeader() {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-2 z-20 w-full">
      <button
        className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        aria-label="Menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold tracking-tight text-white uppercase">
          GadgetSwipe
        </h1>
        <span className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: "0 0 8px rgba(13,242,105,0.8)" }} />
      </div>

      <button
        className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        aria-label="Filter"
      >
        <span className="material-symbols-outlined">tune</span>
      </button>
    </header>
  );
}
