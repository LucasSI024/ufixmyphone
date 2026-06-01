import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Wrench, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { ensureProfile } from "@/lib/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reparateur")({
  head: () => ({
    meta: [
      { title: "Reparateur worden — UFixMyPhone" },
      { name: "description", content: "Word reparateur op UFixMyPhone. KvK-nummer verplicht." },
    ],
  }),
  component: ReparateurPage,
});

const KVK_REGEX = /^\d{8}$/;

function ReparateurPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [kvk, setKvk] = useState("");
  const [busy, setBusy] = useState(false);

  // Als ingelogde gebruiker zonder KvK terugkomt (bv. na Google), vraag KvK
  const [pendingKvk, setPendingKvk] = useState(false);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await ensureProfile(user);
      if (!data.kvk_number) setPendingKvk(true);
      else if (data.repairer_status === "approved") navigate({ to: "/feed" });
    })();
  }, [user, navigate]);

  const submitKvk = async (userId: string, kvkValue: string, name?: string) => {
    if (!KVK_REGEX.test(kvkValue)) {
      toast.error("KvK-nummer moet 8 cijfers zijn.");
      return false;
    }
    if (user) await ensureProfile(user, { display_name: name });
    const { error } = await supabase
      .from("profiles")
      .update({
        kvk_number: kvkValue,
        is_repairer: true,
        repairer_status: "approved",
        ...(name ? { display_name: name } : {}),
      })
      .eq("id", userId);
    if (error) {
      toast.error(error.message);
      return false;
    }
    setPendingKvk(false);
    toast.success("KvK opgeslagen. Je kan nu als reparateur bieden.");
    return true;
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!KVK_REGEX.test(kvk)) return toast.error("Vul een geldig KvK-nummer in (8 cijfers).");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/reparateur`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    if (data.user) {
      await ensureProfile(data.user, { display_name: displayName || email.split("@")[0] });
      await submitKvk(data.user.id, kvk, displayName);
    }
    setBusy(false);
    toast.success("Check je e-mail om je account te bevestigen.");
  };

  const handleExistingKvk = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const ok = await submitKvk(user.id, kvk);
    setBusy(false);
    if (ok) navigate({ to: "/feed" });
  };

  const handleGoogle = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/reparateur",
    });
    if (res.error) {
      setBusy(false);
      toast.error("Inloggen met Google mislukt");
    }
  };

  return (
    <div className="bg-gradient-hero flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="bg-gradient-mint shadow-glow flex h-10 w-10 items-center justify-center rounded-lg">
            <Wrench className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold">UFixMyPhone</span>
        </Link>

        <div className="bg-gradient-card shadow-card rounded-2xl border border-border/60 p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">Alleen geverifieerde reparateurs</p>
              <p className="text-muted-foreground">
                Een geldig KvK-nummer is verplicht. Zonder KvK kan je niet worden goedgekeurd.
              </p>
            </div>
          </div>

          {pendingKvk && user ? (
            <form onSubmit={handleExistingKvk} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kvk-only">KvK-nummer</Label>
                <Input
                  id="kvk-only"
                  inputMode="numeric"
                  pattern="\d{8}"
                  maxLength={8}
                  required
                  value={kvk}
                  onChange={(e) => setKvk(e.target.value.replace(/\D/g, ""))}
                  placeholder="12345678"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                Aanmelding voltooien
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="r-name">Bedrijfsnaam</Label>
                  <Input id="r-name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jouw reparatiebedrijf" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-kvk">KvK-nummer <span className="text-destructive">*</span></Label>
                  <Input
                    id="r-kvk"
                    inputMode="numeric"
                    pattern="\d{8}"
                    maxLength={8}
                    required
                    value={kvk}
                    onChange={(e) => setKvk(e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-email">Zakelijk e-mailadres</Label>
                  <Input id="r-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-pw">Wachtwoord</Label>
                  <Input id="r-pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Aanmelden als reparateur
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">of</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                </svg>
                Doorgaan met Google
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Na inloggen met Google vragen we direct om je KvK-nummer.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
