import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_PRICING, SETTINGS, STORAGE_OPTIONS, CONDITIONS, BATTERIES, LOCKS,
  ANDROID_MODELS,
  type Pricing, type IPhoneModel, type DefectKey,
} from "@/lib/iphone-buyback";
import { useAuth } from "@/hooks/use-auth";

async function fetchPricing(): Promise<Pricing> {
  const [{ data: models, error: mErr }, { data: settingsRow, error: sErr }] =
    await Promise.all([
      supabase.from("iphone_models").select("*").order("sort_order", { ascending: true }),
      supabase.from("iphone_settings").select("data").eq("id", 1).maybeSingle(),
    ]);

  if (mErr || sErr) throw new Error(mErr?.message || sErr?.message);

  const mapped: IPhoneModel[] = (models ?? []).map((r: any) => ({
    key: r.key,
    name: r.name,
    generation: r.generation,
    baseStorage: Number(r.base_storage),
    baseValue: Number(r.base_value),
    riskBuffer: Number(r.risk_buffer),
    defects: (r.defects ?? {}) as Record<DefectKey, number>,
  }));

  const d: any = settingsRow?.data ?? {};
  return {
    models: mapped.length ? mapped : DEFAULT_PRICING.models,
    storage: d.storageOptions ?? STORAGE_OPTIONS,
    conditions: d.conditions ?? CONDITIONS,
    batteries: d.batteries ?? BATTERIES,
    locks: d.locks ?? LOCKS,
    settings: {
      profitMargin: d.profitMargin ?? SETTINGS.profitMargin,
      maxBidPct: d.maxBidPct ?? SETTINGS.maxBidPct,
      roundTo: d.roundTo ?? SETTINGS.roundTo,
      minBid: d.minBid ?? SETTINGS.minBid,
      maxDefectStackPct: d.maxDefectStackPct ?? SETTINGS.maxDefectStackPct,
      rangeWidthPct: d.rangeWidthPct ?? SETTINGS.rangeWidthPct,
    },
  };
}

export function useIphonePricing() {
  const { data } = useQuery({
    queryKey: ["iphone-pricing"],
    queryFn: fetchPricing,
    staleTime: 5 * 60 * 1000,
    placeholderData: DEFAULT_PRICING,
  });
  return data ?? DEFAULT_PRICING;
}

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setIsAdmin(false); setChecking(false); return; }
    setChecking(true);
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => { if (!cancelled) { setIsAdmin(!!data); setChecking(false); } });
    return () => { cancelled = true; };
  }, [user]);

  return { isAdmin, checking };
}
