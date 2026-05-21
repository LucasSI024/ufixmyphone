import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Smartphone, Euro, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Mijn account — I Will Make It" }] }),
  component: AccountPage,
});

type Profile = {
  id: string;
  display_name: string;
  city: string | null;
  bio: string | null;
  is_repairer: boolean;
};

function AccountPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const myRequests = useQuery({
    queryKey: ["my-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select("id, device_brand, device_model, status, created_at, bids(count)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const myBids = useQuery({
    queryKey: ["my-bids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("id, price, status, created_at, repair_requests(id, device_brand, device_model)")
        .eq("repairer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const [form, setForm] = useState<Profile | null>(null);
  useEffect(() => { if (profileQuery.data) setForm(profileQuery.data); }, [profileQuery.data]);

  const save = async () => {
    if (!form || !user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name,
      city: form.city,
      bio: form.bio,
      is_repairer: form.is_repairer,
    }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profiel opgeslagen");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Mijn account</h1>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profiel</TabsTrigger>
          <TabsTrigger value="requests">Mijn reparaties</TabsTrigger>
          <TabsTrigger value="bids">Mijn biedingen</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          {form && (
            <div className="bg-gradient-card shadow-card space-y-5 rounded-2xl border border-border/60 p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stad</Label>
                <Input id="city" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Vertel kort over jezelf of je reparatiebedrijf..." />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4">
                <div>
                  <Label htmlFor="rep" className="text-base">Ik ben reparateur</Label>
                  <p className="text-xs text-muted-foreground">Schakel in om biedingen te kunnen doen op reparaties.</p>
                </div>
                <Switch id="rep" checked={form.is_repairer} onCheckedChange={(c) => setForm({ ...form, is_repairer: c })} />
              </div>
              <Button onClick={save} className="shadow-glow">Opslaan</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-3">
          <div className="bg-gradient-card shadow-card flex flex-col gap-3 rounded-2xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">Plaats een nieuwe reparatie</div>
              <p className="text-xs text-muted-foreground">Komt op je eigen profiel én in de algemene feed.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="shadow-glow">
                <Link to="/new"><Plus className="h-4 w-4" /> Plaats reparatie</Link>
              </Button>
              {user && (
                <Button asChild variant="outline">
                  <Link to="/u/$id" params={{ id: user.id }}>Mijn profiel</Link>
                </Button>
              )}
            </div>
          </div>
          {myRequests.data?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Je hebt nog geen reparaties geplaatst.
            </p>
          )}
          {myRequests.data?.map((r) => (
            <Link key={r.id} to="/request/$id" params={{ id: r.id }} className="bg-gradient-card shadow-card flex items-center gap-4 rounded-2xl border border-border/60 p-4 hover:border-primary/50">
              <Smartphone className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">{r.device_brand} {r.device_model}</div>
                <div className="text-xs text-muted-foreground">{r.bids[0]?.count ?? 0} biedingen</div>
              </div>
              <Badge variant={r.status === "open" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="bids" className="mt-6 space-y-3">
          {myBids.data?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Je hebt nog geen biedingen gedaan. <Link to="/feed" className="text-primary hover:underline">Bekijk open reparaties</Link>.
            </p>
          )}
          {myBids.data?.map((b) => (
            <Link key={b.id} to="/request/$id" params={{ id: b.repair_requests.id }} className="bg-gradient-card shadow-card flex items-center gap-4 rounded-2xl border border-border/60 p-4 hover:border-primary/50">
              <Euro className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">{b.repair_requests.device_brand} {b.repair_requests.device_model}</div>
                <div className="text-xs text-muted-foreground">Jouw bod: €{Number(b.price).toFixed(0)}</div>
              </div>
              <Badge variant={b.status === "accepted" ? "default" : "secondary"} className="capitalize">{b.status}</Badge>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </main>
  );
}
