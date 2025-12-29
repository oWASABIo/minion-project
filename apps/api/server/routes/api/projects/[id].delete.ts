import { useSupabaseAuth } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  const { supabase, user } = await useSupabaseAuth(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing project ID",
    });
  }

  // Soft delete project (update deleted_at timestamp)
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    success: true,
  };
});
