import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const authHeader = getRequestHeader(event, "Authorization");

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing Authorization header",
    });
  }

  // Initialize Supabase Client
  // We use the ANON key here because we want to respect RLS with the user's token
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

  // Insert Project
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: body.name,
      config: body.config,
    })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    success: true,
    project: data,
  };
});
