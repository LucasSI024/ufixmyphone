import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Smartphone, MapPin, Euro, Clock, Plus, Inbox, Search, X, Wrench, ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { REPAIR_CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Open reparaties — repaireally" }] }),
  component: FeedPage,
});

type RequestRow = {
  id: string;
  device_brand: string;
  device_model: string;
  problem_description: string;
  city: string;
  budget_max: number | null;
  category: string | null;
  listing_type: string;
  product_type: string;
  status: string;
  created_at: string;
  owner_id: string;
  bids: { count: number }[];
};

function FeedPage() {
  const [tab, setTab] = useState<ListingType>("repair");
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "budget_high" | "budget_low">("newest");

  const { data, isLoading } = useQuery({
    queryKey: ["feed-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select("id, device_brand, device_model, problem_description, city, budget_max, category, listing_type, product_type, status, created_at, owner_id, bids(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as RequestRow[];
    },
  });

  const counts = useMemo(() => ({
    repair: (data ?? []).filter((r) => (r.listing_type ?? "repair") === "repair").length,
    sell: (data ?? []).filter((r) => r.listing_type === "sell").length,
  }), [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const c = city.trim().toLowerCase();
    const s = search.trim().toLowerCase();
    const result = data.filter((r) => {
      if ((r.listing_type ?? "repair") !== tab) return false;
      if (tab === "repair" && category && r.category !== category) return false;
      if (c && !r.city.toLowerCase().includes(c)) return false;
      if (s) {
        const hay = `${r.device_brand} ${r.device_model} ${r.problem_description} ${r.category ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    if (sort === "budget_high") {
      result.sort((a, b) => (b.budget_max ?? 0) - (a.budget_max ?? 0));
    } else if (sort === "budget_low") {
      result.sort((a, b) => (a.budget_max ?? Number.MAX_SAFE_INTEGER) - (b.budget_max ?? Number.MAX_SAFE_INTEGER));
    }
    return result;
  }, [data, tab, category, city, search, sort]);


  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              <Wrench className="h-3 w-3" /> Voor aangesloten bedrijven
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              {tab === "repair" ? "Open reparatieaanvragen" : "Producten te koop"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "repair"
                ? "Breng een reparatieofferte uit. Zoek op merk, model, onderdeel of probleem."
                : "Breng een inkoopbod uit. Na acceptatie controleer je het product en betaal je uit."}
            </p>
          </div>
          <Button asChild className="shadow-glow">
            <Link to="/new"><Plus className="h-4 w-4" /> Plaatsen</Link>
          </Button>
        </div>

        {/* Reparatie / verkoop */}
        <div className="mb-4 inline-flex rounded-xl border border-border/60 bg-background/40 p-1">
          {(["repair", "sell"] as ListingType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setCategory(null); }}
              aria-pressed={tab === t}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "repair" ? "Repareren" : "Verkopen"}
              <span className="ml-2 text-xs opacity-70">{counts[t]}</span>
            </button>
          ))}
        </div>


        {/* Filters */}
        <div className="bg-gradient-card mb-6 space-y-3 rounded-2xl border border-border/60 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek op merk, model, onderdeel of probleem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr,200px]">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Stad of postcode..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger>
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Nieuwste eerst</SelectItem>
                <SelectItem value="budget_high">Hoogste budget</SelectItem>
                <SelectItem value="budget_low">Laagste budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tab === "repair" && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                category === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Alle
            </button>
            {categoriesForProduct("phone").map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? null : c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          )}


          {(category || city || search || sort !== "newest") && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">{filtered.length} resultaten</span>
              <button
                onClick={() => { setCategory(null); setCity(""); setSearch(""); setSort("newest"); }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Filters wissen
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gradient-card flex flex-col items-center rounded-2xl border border-border/60 p-12 text-center">
            <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-display text-xl font-semibold">
              {data && data.length > 0 ? "Geen resultaten" : "Nog geen open reparaties"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {data && data.length > 0
                ? "Pas je filters aan of wis ze om alles te zien."
                : "Wees de eerste! Plaats je kapotte toestel en ontvang biedingen."}
            </p>
            <Button asChild className="mt-6">
              <Link to="/new"><Plus className="h-4 w-4" /> Plaats reparatie</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((req) => (
              <li key={req.id} className="bg-gradient-card shadow-card group rounded-2xl border border-border/60 p-5 transition-all hover:border-primary/50 hover:shadow-glow">
                <Link to="/request/$id" params={{ id: req.id }} className="block">
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
                      {req.category && (
                        <span className="mt-1 inline-block rounded-full bg-accent/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {req.category}
                        </span>
                      )}
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
                <div className="mt-3 flex justify-end border-t border-border/40 pt-3">
                  <Link
                    to="/u/$id"
                    params={{ id: req.owner_id }}
                    className="text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    Bekijk profiel van plaatser →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
