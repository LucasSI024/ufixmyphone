import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Wrench, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-pricing";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const navItem = (to: string, label: string, opts?: { highlight?: boolean; subtle?: boolean }) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={cn(
          "rounded-md px-2 py-1.5 text-sm transition-colors whitespace-nowrap",
          opts?.highlight
            ? active
              ? "bg-primary/10 font-semibold text-primary"
              : "font-semibold text-foreground hover:bg-primary/10 hover:text-primary"
            : opts?.subtle
              ? active
                ? "font-medium text-foreground"
                : "font-normal text-muted-foreground/70 hover:text-foreground"
            : active
              ? "font-medium text-primary"
              : "font-medium text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto grid h-16 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
        {/* Logo */}
        <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-mint shadow-glow">
            <Wrench className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight leading-none">
            repaireally
          </span>

        </Link>

        {/* Nav: Aanbod — Reparateur worden — Telefoon verkopen (naast elkaar) */}
        <nav className="hidden items-center justify-center gap-2 md:flex">
          {navItem("/feed", "Aanbod")}
          {navItem("/reparateur", "Reparateur worden", { highlight: true })}
          {navItem("/verkoop", "Telefoon verkopen", { subtle: true })}
        </nav>

        {/* Rechts: account */}
        <div className="flex items-center justify-end gap-1">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild size="icon" variant="ghost" title="Beheer">
                  <Link to="/admin/inkoop-prijzen"><Shield className="h-5 w-5" /></Link>
                </Button>
              )}
              <NotificationBell />
              <Button asChild size="icon" variant="ghost">
                <Link to="/account" aria-label="Mijn account"><UserIcon className="h-5 w-5" /></Link>
              </Button>
              <Button size="icon" variant="ghost" onClick={handleSignOut} aria-label="Uitloggen">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link to="/login">Inloggen</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobiele secundaire nav */}
      <nav className="grid grid-cols-3 items-center gap-1 border-t border-border/40 px-3 py-2 md:hidden">
        <Link
          to="/feed"
          className={cn(
            "rounded-md px-2 py-1 text-center text-xs font-medium",
            pathname.startsWith("/feed") ? "text-primary" : "text-muted-foreground"
          )}
        >
          Aanbod
        </Link>
        <Link
          to="/reparateur"
          className={cn(
            "rounded-md px-2 py-1 text-center text-xs font-semibold",
            pathname.startsWith("/reparateur") ? "bg-primary/10 text-primary" : "text-foreground"
          )}
        >
          Reparateur worden
        </Link>
        <Link
          to="/verkoop"
          className={cn(
            "rounded-md px-2 py-1 text-center text-xs font-normal",
            pathname.startsWith("/verkoop") ? "text-foreground" : "text-muted-foreground/70"
          )}
        >
          Verkopen
        </Link>
      </nav>
    </header>
  );
}

