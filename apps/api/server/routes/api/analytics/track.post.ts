import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { projectId, eventType, metadata } = body;

  if (!projectId || !eventType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing projectId or eventType",
    });
  }

  // Initialize Supabase Client (using service role for tracking - no auth required)
  const supabase = createClient(
    config.SUPABASE_URL || process.env.SUPABASE_URL,
    config.SUPABASE_KEY || process.env.SUPABASE_KEY
  );

  // Simple Fire-and-Forget insert (public tracking endpoint)
  const { error } = await supabase.from("analytics_events").insert({
    project_id: projectId,
    event_type: eventType,
    metadata: metadata || {},
  });

  if (error) {
    console.error("Analytics Error:", error);
    // Don't fail the request to the client, just log it
    return { success: false };
  }

  return { success: true };
});
