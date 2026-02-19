import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <main className="flex flex-col items-center gap-8 text-center max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-5xl">⚡</div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">
            GadgetSwipe
          </h1>
          <p className="text-lg text-text-secondary">
            Discover your next favorite gadget
          </p>
        </div>

        {/* How it works */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-4 rounded-2xl bg-bg-card p-4 border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
              1
            </div>
            <div className="text-left">
              <p className="font-semibold text-text-primary">Swipe</p>
              <p className="text-sm text-text-secondary">
                Right for love, left to pass, up for super like
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-bg-card p-4 border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
              2
            </div>
            <div className="text-left">
              <p className="font-semibold text-text-primary">Match</p>
              <p className="text-sm text-text-secondary">
                Our algorithm finds your top 3 gadgets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-bg-card p-4 border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
              3
            </div>
            <div className="text-left">
              <p className="font-semibold text-text-primary">Shop</p>
              <p className="text-sm text-text-secondary">
                Get the best deals on your matched gadgets
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/swipe"
          className="w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-glow transition-all hover:brightness-110 hover:shadow-xl hover:shadow-accent-glow active:scale-95"
        >
          Start Swiping
        </Link>

        <p className="text-xs text-text-secondary">
          No sign-up required. Just swipe.
        </p>
      </main>
    </div>
  );
}
