import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, MapPin, Euro, Clock, Wrench, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/u/$id")({
  head: () => ({ meta: [{ title: "Profiel — repaireally" }] }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  display_name: string;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_repairer: boolean;
  created_at: string;
};

type Request = {
  id: string;
  device_brand: string;
  device_model: string;
  problem_description: string;
  city: string;
  budget_max: number | null;
  category: string | null;
  status: string;
  created_at: string;
  bids: { count: number }[];
};

function ProfilePage() {
  const { id } = Route.useParams();

  const profile = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, city, bio, avatar_url, is_repairer, created_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const requests = useQuery({
    queryKey: ["public-profile-requests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select("id, device_brand, device_model, problem_description, city, budget_max, category, status, created_at, bids(count)")
        .eq("owner_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Request[];
    },
  });

  const p = profile.data;
  const open = requests.data?.filter((r) => r.status === "open") ?? [];
  const closed = requests.data?.filter((r) => r.status !== "open") ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {profile.isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-surface" />
        ) : !p ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
            Profiel niet gevonden.
          </div>
        ) : (
          <>
            <section className="bg-gradient-card shadow-card flex flex-col gap-4 rounded-2xl border border-border/60 p-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.display_name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">{p.display_name}</h1>
                  {p.is_repairer && (
                    <Badge className="bg-gradient-mint text-primary-foreground">
                      <Wrench className="mr-1 h-3 w-3" /> Reparateur
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {p.city && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}</span>
                  )}
                  <span>Lid sinds {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: nl })}</span>
                </div>
                {p.bio && <p className="mt-3 text-sm text-foreground/80">{p.bio}</p>}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Open reparaties ({open.length})</h2>
              {open.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  Geen open reparaties op dit profiel.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {open.map((r) => (
                    <RequestCard key={r.id} r={r} />
                  ))}
                </ul>
              )}
            </section>

            {closed.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-muted-foreground">Afgerond / gesloten ({closed.length})</h2>
                <ul className="mt-3 space-y-3 opacity-70">
                  {closed.map((r) => (
                    <RequestCard key={r.id} r={r} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function RequestCard({ r }: { r: Request }) {
  return (
    <li>
      <Link
        to="/request/$id"
        params={{ id: r.id }}
        className="bg-gradient-card shadow-card group block rounded-2xl border border-border/60 p-5 transition-all hover:border-primary/50 hover:shadow-glow"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary">
                {r.device_brand} {r.device_model}
              </h3>
              <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                {r.bids[0]?.count ?? 0} bod{(r.bids[0]?.count ?? 0) === 1 ? "" : "den"}
              </span>
            </div>
            {r.category && (
              <span className="mt-1 inline-block rounded-full bg-accent/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                {r.category}
              </span>
            )}
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.problem_description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.city}</span>
              {r.budget_max != null && (
                <span className="flex items-center gap-1"><Euro className="h-3.5 w-3.5" /> max €{Number(r.budget_max).toFixed(0)}</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: nl })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
