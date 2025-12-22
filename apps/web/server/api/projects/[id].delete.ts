import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = (await serverSupabaseUser(event)) as any;
  const client = await serverSupabaseClient<Database>(event);
  const id = event.context.params?.id;

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  if (!id) {
    throw createError({ statusCode: 400, message: "Project ID is required" });
  }

  const userId = user.id || user.sub;

  const { error } = await client
    .from("projects")
    // @ts-ignore - Column added via migration
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true };
});
