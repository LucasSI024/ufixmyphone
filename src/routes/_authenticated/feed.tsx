import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, MapPin, Euro, Clock, Plus, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Open reparaties — Fixbod" }] }),
  component: FeedPage,
});

type RequestRow = {
  id: string;
  device_brand: string;
  device_model: string;
  problem_description: string;
  city: string;
  budget_max: number | null;
  status: string;
  created_at: string;
  owner_id: string;
  bids: { count: number }[];
};

function FeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select("id, device_brand, device_model, problem_description, city, budget_max, status, created_at, owner_id, bids(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as RequestRow[];
    },
  });

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Open reparaties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Doe een bod of plaats je eigen reparatie.
          </p>
        </div>
        <Button asChild className="shadow-glow">
          <Link to="/new"><Plus className="h-4 w-4" /> Plaatsen</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-gradient-card flex flex-col items-center rounded-2xl border border-border/60 p-12 text-center">
          <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="font-display text-xl font-semibold">Nog geen open reparaties</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Wees de eerste! Plaats je kapotte toestel en ontvang biedingen.
          </p>
          <Button asChild className="mt-6">
            <Link to="/new"><Plus className="h-4 w-4" /> Plaats reparatie</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((req) => (
            <li key={req.id}>
              <Link
                to="/request/$id"
                params={{ id: req.id }}
                className="bg-gradient-card shadow-card group block rounded-2xl border border-border/60 p-5 transition-all hover:border-primary/50 hover:shadow-glow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary">
                        {req.device_brand} {req.device_model}
                      </h3>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {req.bids[0]?.count ?? 0} bod{(req.bids[0]?.count ?? 0) === 1 ? "" : "den"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{req.problem_description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {req.city}</span>
                      {req.budget_max != null && (
                        <span className="flex items-center gap-1"><Euro className="h-3.5 w-3.5" /> max €{Number(req.budget_max).toFixed(0)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: nl })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
