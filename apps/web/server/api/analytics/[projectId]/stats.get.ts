import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const client = await serverSupabaseClient<Database>(event);
  const projectId = event.context.params?.projectId;

  if (!user || !projectId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  // Handle various JWT shapes
  const userId = (user as any).id || (user as any).sub;

  // 1. Verify Ownership
  // @ts-ignore
  const { data: project } = await client
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (!project) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  // 2. Fetch Stats (Parallel Queries for speed)
  // Total Views
  // @ts-ignore
  const viewsPromise = client
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("event_type", "page_view");

  // Total Clicks
  // @ts-ignore
  const clicksPromise = client
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("event_type", "click");

  // Recent Events
  // @ts-ignore
  const recentPromise = client
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
