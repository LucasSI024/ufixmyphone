import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({ meta: [{ title: "Reparatie plaatsen — Fixbod" }] }),
  component: NewRequestPage,
});

function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    device_brand: "",
    device_model: "",
    problem_description: "",
    city: "",
    budget_max: "",
  });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("repair_requests")
      .insert({
        owner_id: user.id,
        device_brand: form.device_brand.trim(),
        device_model: form.device_model.trim(),
        problem_description: form.problem_description.trim(),
        city: form.city.trim(),
        budget_max: form.budget_max ? Number(form.budget_max) : null,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Je reparatie staat live!");
    navigate({ to: "/request/$id", params: { id: data.id } });
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-gradient-mint flex h-11 w-11 items-center justify-center rounded-xl">
          <Smartphone className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Plaats je reparatie</h1>
          <p className="text-sm text-muted-foreground">Reparateurs reageren binnen enkele uren.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-gradient-card shadow-card space-y-5 rounded-2xl border border-border/60 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">Merk</Label>
            <Input id="brand" required placeholder="Bijv. iPhone, Samsung" value={form.device_brand} onChange={upd("device_brand")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" required placeholder="Bijv. 14 Pro, S23" value={form.device_model} onChange={upd("device_model")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prob">Wat is er kapot?</Label>
          <Textarea id="prob" required rows={4} placeholder="Beschrijf het probleem zo duidelijk mogelijk: gebarsten scherm, accu leeg, niet meer aan..." value={form.problem_description} onChange={upd("problem_description")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Stad</Label>
            <Input id="city" required placeholder="Bijv. Amsterdam" value={form.city} onChange={upd("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Maximaal budget (€) — optioneel</Label>
            <Input id="budget" type="number" min="0" step="1" placeholder="150" value={form.budget_max} onChange={upd("budget_max")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/feed" })}>Annuleren</Button>
          <Button type="submit" disabled={busy} className="shadow-glow">
            {busy ? "Plaatsen..." : "Plaatsen"}
          </Button>
        </div>
      </form>
    </main>
  );
}
