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

  const navItem = (to: string, label: string, opts?: { highlight?: boolean }) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={cn(
          "text-sm font-medium transition-colors whitespace-nowrap",
          opts?.highlight
            ? active
              ? "text-primary"
              : "text-foreground hover:text-primary"
            : active
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-mint shadow-glow">
            <Wrench className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            UFixMyPhone
          </span>

        </Link>

        {/* Nav: Aanbod — Reparateur worden — Telefoon verkopen (naast elkaar) */}
        <nav className="hidden md:flex items-center gap-7">
          {navItem("/feed", "Aanbod")}
          {navItem("/reparateur", "Reparateur worden", { highlight: true })}
          <Link
            to="/verkoop"
            className={cn(
              "text-sm font-normal whitespace-nowrap transition-colors",
              pathname.startsWith("/verkoop")
                ? "text-foreground"
                : "text-muted-foreground/70 hover:text-foreground"
            )}
          >
            Telefoon verkopen
          </Link>
        </nav>

        {/* Rechts: account */}
        <div className="flex items-center gap-1">
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
      <nav className="flex items-center justify-center gap-5 border-t border-border/40 py-2 md:hidden">
        <Link
          to="/feed"
          className={cn(
            "text-xs font-medium",
            pathname.startsWith("/feed") ? "text-primary" : "text-muted-foreground"
          )}
        >
          Aanbod
        </Link>
        <Link
          to="/reparateur"
          className={cn(
            "text-xs font-semibold",
            pathname.startsWith("/reparateur") ? "text-primary" : "text-foreground"
          )}
        >
          Reparateur worden
        </Link>
        <Link
          to="/verkoop"
          className={cn(
            "text-xs font-normal",
            pathname.startsWith("/verkoop") ? "text-foreground" : "text-muted-foreground/70"
          )}
        >
          Telefoon verkopen
        </Link>
      </nav>
    </header>
  );
}

