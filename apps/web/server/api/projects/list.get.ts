import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = (await serverSupabaseUser(event)) as any;
  const client = await serverSupabaseClient<Database>(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // FIX: Handle JWT 'sub' claim
  const userId = user.id || user.sub;

  const { data, error } = await client
    .from("projects")
    .select("id, name, created_at, updated_at")
    .eq("user_id", userId) // Use robust ID
    // @ts-ignore - Column added via migration
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { projects: data };
});
