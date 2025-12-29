import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { H3Event } from "h3";

/**
 * Shared utility to get authenticated Supabase client and user from Authorization header
 * This reduces code duplication across all API endpoints
 */
export async function useSupabaseAuth(event: H3Event): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const config = useRuntimeConfig(event);
  const authHeader = getRequestHeader(event, "Authorization");

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing Authorization header",
    });
  }

  // Initialize Supabase Client with forwarded auth header
  const supabase = createClient(
    config.SUPABASE_URL || process.env.SUPABASE_URL || "",
    config.SUPABASE_KEY || process.env.SUPABASE_KEY || "",
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

  return { supabase, user };
}

/**
 * Get Supabase client without authentication (for public endpoints like tracking)
 */
export function useSupabaseClient(event: H3Event): SupabaseClient {
  const config = useRuntimeConfig(event);

  return createClient(
    config.SUPABASE_URL || process.env.SUPABASE_URL || "",
    config.SUPABASE_KEY || process.env.SUPABASE_KEY || ""
  );
}
