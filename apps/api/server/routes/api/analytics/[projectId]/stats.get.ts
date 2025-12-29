import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const authHeader = getRequestHeader(event, "Authorization");
  const projectId = getRouterParam(event, "projectId");

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing Authorization header",
    });
  }

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing project ID",
    });
  }

  // Initialize Supabase Client
  const supabase = createClient(
    config.SUPABASE_URL || process.env.SUPABASE_URL,
    config.SUPABASE_KEY || process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  // Get User from Token
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid Token or User not found",
    });
  }

  // 1. Verify Ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden - Not project owner",
    });
  }

  // 2. Fetch Stats (Parallel Queries for speed)
  // Total Views
  const viewsPromise = supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("event_type", "page_view");

  // Total Clicks
  const clicksPromise = supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("event_type", "click");

  // Recent Events
  const recentPromise = supabase
    .from("analytics_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(10);

  const [viewsRes, clicksRes, recentRes] = await Promise.all([
    viewsPromise,
    clicksPromise,
    recentPromise,
  ]);

  return {
    totalViews: viewsRes.count || 0,
    totalClicks: clicksRes.count || 0,
    recentEvents: recentRes.data || [],
  };
});
