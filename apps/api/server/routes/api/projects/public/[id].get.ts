import { useSupabaseClient } from "../../../../utils/supabase";

export default defineEventHandler(async (event) => {
  // NOTE: This endpoint is PUBLIC. No user auth required.
  const supabase = useSupabaseClient(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing project ID",
    });
  }

  // Fetch project if it is PUBLISHED
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, config, published")
    .eq("id", id)
    .eq("published", true) // CRITICAL: Only allow published projects
    .is("deleted_at", null) // CRITICAL: Don't show deleted projects
    .single();

  if (error || !data) {
    // Return 404 to avoid leaking existence of private projects
    throw createError({
      statusCode: 404,
      statusMessage: "Project not found or not published",
    });
  }

  return { project: data };
});
