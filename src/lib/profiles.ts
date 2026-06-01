import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type PublicProfile = {
  id: string;
  display_name: string;
  city: string | null;
  bio: string | null;
  is_repairer: boolean;
  kvk_number: string | null;
  repairer_status: string;
};

const PROFILE_SELECT = "id, display_name, city, bio, is_repairer, kvk_number, repairer_status";

export function getUserDisplayName(user: User) {
  const meta = user.user_metadata as Record<string, unknown>;
  const name = meta.display_name || meta.full_name || meta.name;

  if (typeof name === "string" && name.trim()) return name.trim();
  if (user.email) return user.email.split("@")[0];

  return "Gebruiker";
}

export async function ensureProfile(user: User, defaults: Partial<PublicProfile> = {}) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as PublicProfile;

  const displayName = defaults.display_name?.trim() || getUserDisplayName(user);
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      display_name: displayName,
      city: defaults.city ?? null,
      bio: defaults.bio ?? null,
      is_repairer: defaults.is_repairer ?? false,
      kvk_number: defaults.kvk_number ?? null,
      repairer_status: defaults.repairer_status ?? "none",
    })
    .select(PROFILE_SELECT)
    .single();

  if (insertError) throw insertError;
  return created as PublicProfile;
}

export async function getPublicProfiles(userIds: string[]) {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  const profiles = new Map<string, PublicProfile>();

  if (ids.length === 0) return profiles;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .in("id", ids);

  if (error) throw error;

  for (const profile of data ?? []) profiles.set(profile.id, profile as PublicProfile);
  return profiles;
}