import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = (await serverSupabaseUser(event)) as any;
  const client = await serverSupabaseClient(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  const { id, published } = body;

  if (!id || typeof published !== "boolean") {
    throw createError({
      statusCode: 400,
      message: "Missing id or published status",
    });
  }

  // FIX: Handle JWT 'sub' claim
  const userId = user.id || user.sub;

  const { data, error } = await (client.from("projects") as any)
    .update({
      published: published,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", id)
    .eq("user_id", userId) // Ensure ownership
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true, project: data };
});
