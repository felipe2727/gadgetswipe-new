import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="text-lg font-bold text-text-primary">
          GadgetSwipe
        </span>
      </Link>
    </nav>
  );
}
