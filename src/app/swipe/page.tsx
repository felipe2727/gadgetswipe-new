export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getGadgetsForSession } from "@/lib/gadgets";
import { SwipeClient } from "./SwipeClient";
import { redirect } from "next/navigation";

export default async function SwipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const gadgets = await getGadgetsForSession(user.id, 25);

  if (gadgets.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">😅</div>
          <h2 className="text-2xl font-bold text-text-primary">
            No gadgets available
          </h2>
          <p className="text-text-secondary max-w-sm">
            We&apos;re refreshing our catalog. Check back soon for new gadgets
            to discover!
          </p>
        </div>
      </div>
    );
  }

  return <SwipeClient initialGadgets={gadgets} />;
}
