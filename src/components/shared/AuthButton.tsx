"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const supabase = createClient();
      supabaseRef.current = supabase;
      supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch {
      // When running locally without env vars, Supabase client creation will fail.
      // That's fine for marketing pages; auth buttons will just stay in logged-out state.
      setUser(null);
      supabaseRef.current = null;
      return;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabaseRef.current?.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  if (user) {
    const initial = user.email?.[0]?.toUpperCase() ?? "U";
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/dashboard/history">History</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/dashboard/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Link href="/login"><Button variant="ghost">Log in</Button></Link>
      <Link href="/signup"><Button>Get started</Button></Link>
    </>
  );
}
