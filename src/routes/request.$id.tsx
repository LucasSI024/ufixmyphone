import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Euro, Clock, Smartphone, Check, Trash2, User as UserIcon, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ensureProfile, getPublicProfiles, type PublicProfile } from "@/lib/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

export const Route = createFileRoute("/request/$id")({
  head: () => ({ meta: [{ title: "Reparatie — I Will Make It" }] }),
  component: RequestDetailPage,
});

type RequestDetail = {
  id: string;
  owner_id: string;
  device_brand: string;
  device_model: string;
  problem_description: string;
  city: string;
  budget_max: number | null;
  status: string;
  accepted_bid_id: string | null;
  created_at: string;
  photo_urls: string[] | null;
  profiles: Pick<PublicProfile, "display_name" | "city"> | null;
};

type Bid = {
  id: string;
  repairer_id: string;
  price: number;
  message: string | null;
  repair_days: number;
  status: string;
  created_at: string;
  profiles: Pick<PublicProfile, "display_name" | "city"> | null;
};

function RequestDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const reqQuery = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const profiles = await getPublicProfiles([data.owner_id]);
      return { ...data, profiles: profiles.get(data.owner_id) ?? null } as unknown as RequestDetail;
    },
  });

  const bidsQuery = useQuery({
    queryKey: ["bids", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("request_id", id)
        .order("price", { ascending: true });
      if (error) throw error;
      const profiles = await getPublicProfiles((data ?? []).map((bid) => bid.repairer_id));
      return (data ?? []).map((bid) => ({
        ...bid,
        profiles: profiles.get(bid.repairer_id) ?? null,
      })) as unknown as Bid[];
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => ensureProfile(user!),
  });

  if (reqQuery.isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-8"><div className="h-64 animate-pulse rounded-2xl bg-surface" /></main>
      </div>
    );
  }
  const req = reqQuery.data;
  if (!req) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-8 text-center">
          <p className="text-muted-foreground">Reparatie niet gevonden.</p>
          <Button asChild variant="ghost" className="mt-4"><Link to="/feed">Terug</Link></Button>
        </main>
      </div>
    );
  }

  const isOwner = user?.id === req.owner_id;
  const myBid = bidsQuery.data?.find((b) => b.repairer_id === user?.id);

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je deze reparatie wilt verwijderen?")) return;
    const { error } = await supabase.from("repair_requests").delete().eq("id", req.id);
    if (error) return toast.error(error.message);
    toast.success("Verwijderd");
    navigate({ to: "/feed" });
  };

  const handleAccept = async (bidId: string) => {
    const { error: bidErr } = await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId);
    if (bidErr) return toast.error(bidErr.message);
    const { error: rejErr } = await supabase.from("bids").update({ status: "rejected" }).eq("request_id", req.id).neq("id", bidId);
    if (rejErr) console.warn(rejErr);
    const { error: reqErr } = await supabase
      .from("repair_requests")
      .update({ status: "in_progress", accepted_bid_id: bidId })
      .eq("id", req.id);
    if (reqErr) return toast.error(reqErr.message);
    toast.success("Bod geaccepteerd!");
    qc.invalidateQueries({ queryKey: ["request", id] });
    qc.invalidateQueries({ queryKey: ["bids", id] });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/feed"><ArrowLeft className="h-4 w-4" /> Terug</Link>
        </Button>

        <div className="bg-gradient-card shadow-card rounded-2xl border border-border/60 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-mint flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
              <Smartphone className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {req.device_brand} {req.device_model}
                </h1>
                <Badge variant={req.status === "open" ? "default" : "secondary"} className="capitalize">
                  {req.status === "open" ? "Open" : req.status === "in_progress" ? "Toegewezen" : req.status}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {req.city}</span>
                {req.budget_max != null && (
                  <span className="flex items-center gap-1"><Euro className="h-3.5 w-3.5" /> max €{Number(req.budget_max).toFixed(0)}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: nl })}
                </span>
                <span className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" /> {req.profiles?.display_name ?? "Onbekend"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 whitespace-pre-line rounded-xl bg-background/40 p-4 text-sm leading-relaxed">
            {req.problem_description}
          </div>

          {req.photo_urls && req.photo_urls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {req.photo_urls.map((url, idx) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-background/40"
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1} van ${req.device_brand} ${req.device_model}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          )}

          {isOwner && req.status === "open" && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Verwijderen
              </Button>
            </div>
          )}
        </div>

        {/* Bids section */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">
            Biedingen {bidsQuery.data && `(${bidsQuery.data.length})`}
          </h2>

          {!user && req.status === "open" && (
            <div className="bg-gradient-card mt-4 flex flex-col items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Wil je op deze reparatie bieden? Log in als reparateur.
              </p>
              <Button asChild size="sm" className="shadow-glow">
                <Link to="/login"><LogIn className="h-4 w-4" /> Inloggen om te bieden</Link>
              </Button>
            </div>
          )}

          {user && !isOwner && req.status === "open" && !myBid && (
            <BidForm requestId={req.id} userId={user.id} onDone={() => qc.invalidateQueries({ queryKey: ["bids", id] })} />
          )}

          <div className="mt-4 space-y-3">
            {bidsQuery.data?.map((bid) => (
              <div
                key={bid.id}
                className={`bg-gradient-card shadow-card rounded-2xl border p-5 ${
                  bid.status === "accepted" ? "border-primary" : "border-border/60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-2xl font-bold text-primary">€{Number(bid.price).toFixed(0)}</span>
                      {bid.status === "accepted" && <Badge className="bg-primary/15 text-primary">Geaccepteerd</Badge>}
                      {bid.status === "rejected" && <Badge variant="secondary">Afgewezen</Badge>}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <strong className="text-foreground">{bid.profiles?.display_name ?? "Reparateur"}</strong>
                      {bid.profiles?.city && ` · ${bid.profiles.city}`}
                      {" · "}klaar in {bid.repair_days} dag{bid.repair_days === 1 ? "" : "en"}
                    </div>
                    {bid.message && (
                      <p className="mt-3 rounded-lg bg-background/40 p-3 text-sm">{bid.message}</p>
                    )}
                  </div>
                  {isOwner && req.status === "open" && (
                    <Button size="sm" onClick={() => handleAccept(bid.id)}>
                      <Check className="h-4 w-4" /> Accepteer
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {bidsQuery.data?.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                Nog geen biedingen. {isOwner ? "Hang tight — reparateurs zien je reparatie nu." : "Wees de eerste om te bieden!"}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function BidForm({ requestId, userId, onDone }: { requestId: string; userId: string; onDone: () => void }) {
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("3");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("bids").insert({
      request_id: requestId,
      repairer_id: userId,
      price: Number(price),
      repair_days: Number(days),
      message: message.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Je bod is geplaatst!");
    setPrice(""); setMessage(""); setDays("3");
    onDone();
  };

  return (
    <form onSubmit={submit} className="bg-gradient-card shadow-card mt-4 space-y-4 rounded-2xl border border-border/60 p-5">
      <h3 className="font-display text-lg font-semibold">Doe een bod</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Prijs (€)</Label>
          <Input id="price" type="number" min="1" step="1" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="days">Klaar in (dagen)</Label>
          <Input id="days" type="number" min="1" max="60" required value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="msg">Bericht (optioneel)</Label>
        <Textarea id="msg" rows={3} placeholder="Vertel waarom de klant voor jou moet kiezen..." value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button type="submit" disabled={busy} className="shadow-glow">
        {busy ? "Versturen..." : "Bod plaatsen"}
      </Button>
    </form>
  );
}
