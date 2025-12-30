import { useSupabaseAuth } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  const { supabase, user } = await useSupabaseAuth(event);

  // Fetch Projects for User
  // Use order by updated_at desc for recent first
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, updated_at, created_at, published, config")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    projects: data || [],
  };
});
