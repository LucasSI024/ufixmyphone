import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Wrench, Plus, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-pricing";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const navItem = (to: string, label: string) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={cn(
          "text-sm font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-mint shadow-glow">
            <Wrench className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">UFixMyPhone</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItem("/feed", "Reparaties")}
          {user && navItem("/account", "Mijn account")}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Button asChild size="sm" variant="default" className="hidden sm:inline-flex">
                <Link to="/new">
                  <Plus className="h-4 w-4" />
                  Plaats reparatie
                </Link>
              </Button>
              <Button asChild size="icon" variant="ghost" className="sm:hidden">
                <Link to="/new"><Plus className="h-5 w-5" /></Link>
              </Button>
              <Button asChild size="icon" variant="ghost" className="md:hidden">
                <Link to="/account"><UserIcon className="h-5 w-5" /></Link>
              </Button>
              <Button size="icon" variant="ghost" onClick={handleSignOut} aria-label="Uitloggen">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Inloggen</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
