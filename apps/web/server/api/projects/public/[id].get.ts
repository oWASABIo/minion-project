import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // NOTE: This endpoint is PUBLIC. No user auth required.
  const client = await serverSupabaseClient(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "Missing ID" });
  }

  // Fetch project if it is PUBLISHED
  const { data, error } = await client
    .from("projects")
    .select("id, name, config, published")
    .eq("id", id)
    .eq("published", true) // CRITICAL: Only allowed published projects
    .single();

  if (error || !data) {
    // Return 404 to avoid leaking existence of private projects
    throw createError({
      statusCode: 404,
      message: "Project not found or not published",
    });
  }

  return { project: data };
});
