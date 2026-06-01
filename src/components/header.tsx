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
      <div className="container mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        {/* Links: logo (home) + Aanbod */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2" aria-label="Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-mint shadow-glow">
              <Wrench className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">
              UFixMyPhone
            </span>
          </Link>
          <nav className="hidden md:block">{navItem("/feed", "Aanbod")}</nav>
        </div>

        {/* Midden: Reparateur worden */}
        <nav className="hidden md:flex justify-center">
          {navItem("/reparateur", "Reparateur worden", { highlight: true })}
        </nav>

        {/* Rechts: Telefoon verkopen + account */}
        <div className="flex items-center justify-end gap-2">
          <Button asChild size="sm" variant="default" className="hidden sm:inline-flex">
            <Link to="/verkoop">Telefoon verkopen</Link>
          </Button>
          <Button asChild size="sm" variant="default" className="sm:hidden">
            <Link to="/verkoop">Verkopen</Link>
          </Button>

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
      <nav className="flex items-center justify-center gap-6 border-t border-border/40 py-2 md:hidden">
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
            "text-xs font-medium",
            pathname.startsWith("/reparateur") ? "text-primary" : "text-foreground"
          )}
        >
          Reparateur worden
        </Link>
      </nav>
    </header>
  );
}
