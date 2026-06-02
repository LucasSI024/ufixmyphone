import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  kvk: z.string().regex(/^\d{8}$/, "KvK-nummer moet 8 cijfers zijn"),
  display_name: z.string().min(1).max(120).optional(),
});

export const submitRepairerKvk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure a profile row exists
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      const { error: insErr } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        display_name: data.display_name?.trim() || "Reparateur",
        is_repairer: true,
        kvk_number: data.kvk,
        repairer_status: "approved",
      });
      if (insErr) throw new Error(insErr.message);
      return { ok: true };
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        kvk_number: data.kvk,
        is_repairer: true,
        repairer_status: "approved",
        ...(data.display_name ? { display_name: data.display_name } : {}),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
