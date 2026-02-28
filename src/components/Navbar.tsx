"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsAnonymous(!user || user.is_anonymous === true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAnonymous(!u || u.is_anonymous === true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="text-lg font-bold text-text-primary">
          GadgetSwipe
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {isAnonymous ? (
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
        ) : (
          <>
            <Link
              href="/admin/gadgets"
              className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Admin
            </Link>
            <span className="text-xs text-text-secondary truncate max-w-[120px]">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
