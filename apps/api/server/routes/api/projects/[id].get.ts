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

  // Fetch Project
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project not found",
    });
  }

  return {
    project: data,
  };
});
