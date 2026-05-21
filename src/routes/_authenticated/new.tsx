import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Smartphone, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const MAX_PHOTOS = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

type PendingPhoto = { file: File; previewUrl: string };

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({ meta: [{ title: "Reparatie plaatsen — Fixbod" }] }),
  component: NewRequestPage,
});

const PROBLEM_TYPES = [
  "Gebarsten scherm",
  "Touchscreen werkt niet",
  "Accu / batterij",
  "Laadpoort / laadt niet op",
  "Camera",
  "Speaker / microfoon",
  "Knoppen (aan/uit, volume)",
  "Waterschade",
  "Gaat niet meer aan",
  "Software / vastgelopen",
  "Anders",
] as const;

const WHEN_OPTIONS = [
  "Vandaag",
  "Deze week",
  "Deze maand",
  "Langer geleden",
] as const;

const CONDITION_OPTIONS = [
  "Gaat nog aan, werkt grotendeels",
  "Gaat aan, maar werkt slecht",
  "Gaat niet meer aan",
  "Weet ik niet",
] as const;

const EXTRA_DEFECTS = [
  "Accu houdt slecht stand",
  "Scherm heeft krassen / deuken",
  "Behuizing beschadigd",
  "Knoppen klemmen",
  "Eerder gerepareerd",
  "In contact geweest met water",
] as const;

function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    device_brand: "",
    device_model: "",
    problem_type: "",
    problem_when: "",
    cause: "",
    condition: "",
    tried: "",
    details: "",
    city: "",
    budget_max: "",
  });
  const [extras, setExtras] = useState<string[]>([]);

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleExtra = (label: string, checked: boolean) =>
    setExtras((x) => (checked ? [...x, label] : x.filter((v) => v !== label)));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.details.trim().length < 20) {
      toast.error("Geef minimaal 20 tekens uitleg bij 'Extra details'.");
      return;
    }

    // Bundle structured answers into one rich description.
    const description = [
      `**Probleem:** ${form.problem_type}`,
      `**Wanneer ontstaan:** ${form.problem_when}`,
      form.cause.trim() && `**Hoe gebeurd:** ${form.cause.trim()}`,
      `**Toestand toestel:** ${form.condition}`,
      form.tried.trim() && `**Al geprobeerd:** ${form.tried.trim()}`,
      extras.length > 0 && `**Extra gebreken:** ${extras.join(", ")}`,
      "",
      form.details.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    setBusy(true);
    const { data, error } = await supabase
      .from("repair_requests")
      .insert({
        owner_id: user.id,
        device_brand: form.device_brand.trim(),
        device_model: form.device_model.trim(),
        problem_description: description,
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
          <p className="text-sm text-muted-foreground">
            Vul alles in — hoe completer, hoe scherper de biedingen.
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed">
        <p className="font-display text-base font-semibold text-primary">Zo werkt het eerlijk</p>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Vul het formulier volledig in.</strong> Reparateurs
            kunnen alleen een goed bod doen als ze precies weten wat er aan de hand is.
          </li>
          <li>
            Vermeld <strong className="text-foreground">bekende extra gebreken</strong> direct
            (accu, water, eerder gerepareerd, etc.).
          </li>
          <li>
            Komt de reparateur <strong className="text-foreground">onverwachte schade</strong> tegen?
            Dan moet die dit aantonen met{" "}
            <strong className="text-foreground">foto's of video</strong> vóór er extra kosten worden
            gerekend.
          </li>
        </ul>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-gradient-card shadow-card space-y-6 rounded-2xl border border-border/60 p-6 sm:p-8"
      >
        {/* Toestel */}
        <fieldset className="space-y-4">
          <legend className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            1. Toestel
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Merk *</Label>
              <Input
                id="brand"
                required
                placeholder="Bijv. iPhone, Samsung"
                value={form.device_brand}
                onChange={upd("device_brand")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                required
                placeholder="Bijv. 14 Pro, S23"
                value={form.device_model}
                onChange={upd("device_model")}
              />
            </div>
          </div>
        </fieldset>

        {/* Probleem */}
        <fieldset className="space-y-4">
          <legend className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            2. Wat is er kapot?
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Hoofdprobleem *</Label>
              <Select
                value={form.problem_type}
                onValueChange={(v) => setForm((f) => ({ ...f, problem_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een categorie" />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wanneer ontstaan? *</Label>
              <Select
                value={form.problem_when}
                onValueChange={(v) => setForm((f) => ({ ...f, problem_when: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies wanneer" />
                </SelectTrigger>
                <SelectContent>
                  {WHEN_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cause">Hoe is het gebeurd? *</Label>
            <Input
              id="cause"
              required
              placeholder="Bijv. uit zak gevallen op straat, water op gemorst..."
              value={form.cause}
              onChange={upd("cause")}
            />
          </div>

          <div className="space-y-2">
            <Label>Huidige toestand van het toestel *</Label>
            <Select
              value={form.condition}
              onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kies een optie" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </fieldset>

        {/* Extra gebreken */}
        <fieldset className="space-y-3">
          <legend className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            3. Extra gebreken (vink aan wat van toepassing is)
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXTRA_DEFECTS.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm hover:border-primary/50"
              >
                <Checkbox
                  checked={extras.includes(d)}
                  onCheckedChange={(c) => toggleExtra(d, Boolean(c))}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Eigen uitleg */}
        <fieldset className="space-y-4">
          <legend className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            4. Eigen uitleg
          </legend>

          <div className="space-y-2">
            <Label htmlFor="tried">Heb je zelf al iets geprobeerd? (optioneel)</Label>
            <Input
              id="tried"
              placeholder="Bijv. herstart, andere lader, reset..."
              value={form.tried}
              onChange={upd("tried")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Extra details * (min. 20 tekens)</Label>
            <Textarea
              id="details"
              required
              rows={4}
              minLength={20}
              placeholder="Beschrijf zo precies mogelijk wat er gebeurt, wanneer en wat de reparateur moet weten."
              value={form.details}
              onChange={upd("details")}
            />
            <p className="text-xs text-muted-foreground">
              {form.details.trim().length}/20 tekens minimaal
            </p>
          </div>
        </fieldset>

        {/* Locatie + budget */}
        <fieldset className="space-y-4">
          <legend className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            5. Locatie & budget
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Stad *</Label>
              <Input
                id="city"
                required
                placeholder="Bijv. Amsterdam"
                value={form.city}
                onChange={upd("city")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Max budget (€) — optioneel</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="1"
                placeholder="150"
                value={form.budget_max}
                onChange={upd("budget_max")}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/feed" })}>
            Annuleren
          </Button>
          <Button type="submit" disabled={busy} className="shadow-glow">
            {busy ? "Plaatsen..." : "Plaatsen"}
          </Button>
        </div>
      </form>
    </main>
  );
}
