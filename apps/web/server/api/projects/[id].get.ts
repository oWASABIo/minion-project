import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = (await serverSupabaseUser(event)) as any;
  const client = await serverSupabaseClient<Database>(event);
  const id = getRouterParam(event, "id");

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  if (!id) {
    throw createError({ statusCode: 400, message: "Missing ID" });
  }

  // FIX: Handle JWT 'sub' claim
  const userId = user.id || user.sub;

  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId) // Robust check
    // @ts-ignore - Column added via migration
    .is("deleted_at", null)
    .single();

  if (error) {
    throw createError({ statusCode: 404, message: "Project not found" });
  }

  return { project: data };
});
