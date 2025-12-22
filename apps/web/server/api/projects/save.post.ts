import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = (await serverSupabaseUser(event)) as any; // Cast to any to access .sub if needed
  // @ts-ignore
  const client = await serverSupabaseClient<any>(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // FIX: Handle case where 'user' is a JWT payload (has 'sub') instead of full User object (has 'id')
  const userId = user.id || user.sub;

  if (!userId) {
    console.error(
      "[CRITICAL] User ID is undefined in object:",
      JSON.stringify(user)
    );
    throw createError({
      statusCode: 500,
      message: "Internal Auth Error: User ID missing",
    });
  }

  const body = await readBody(event);
  const { name, config, id } = body;

  if (!name || !config) {
    throw createError({ statusCode: 400, message: "Missing name or config" });
  }

  try {
    // SECURITY NOTE: We verify 'user' above, so we can securely call the Admin RPC
    // passing the user.id. This bypasses RLS flakes.
    const { data: rpcResult, error: rpcError } = await client.rpc(
      "admin_upsert_project",
      {
        p_user_id: userId,
        p_id: id || null,
        p_name: name,
        p_config: config,
      }
    );

    if (rpcError) {
      console.error("[Supabase RPC Error]:", rpcError);
      throw createError({ statusCode: 500, message: rpcError.message });
    }

    const result = rpcResult as any;

    if (result?.error) {
      throw createError({ statusCode: 403, message: result.error });
    }

    return { success: true, project: result?.data };
  } catch (err: any) {
    console.error("[Server Error]:", err);
    throw createError({ statusCode: 500, message: err.message });
  }
});
