import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { projectId, eventType, metadata } = body;

  if (!projectId || !eventType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing projectId or eventType",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  // Simple Fire-and-Forget insert
  // We use '@ts-ignore' because the table might not exist in types yet until migration is run & types regenerated
  // @ts-ignore
  const { error } = await client.from("analytics_events").insert({
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
