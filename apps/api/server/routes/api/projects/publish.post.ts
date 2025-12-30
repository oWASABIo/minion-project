import { useSupabaseAuth } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  const { supabase, user } = await useSupabaseAuth(event);
  const body = await readBody(event);

  // Validate Input
  const { id, published } = body;
  if (!id || typeof published !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing id or published status",
    });
  }

  // Update Project
  const { data, error } = await supabase
    .from("projects")
    .update({
      published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id) // Ensure ownership
    .is("deleted_at", null) // Don't update deleted projects
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    success: true,
    project: data,
  };
});
