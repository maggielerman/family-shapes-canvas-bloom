// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import JSZip from "https://deno.land/x/jszip@0.11.0/mod.ts";

serve(async (req) => {
  try {
    const { options } = await req.json();

    // Grab auth header to identify user making the request
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          persistSession: false,
        },
      },
    );

    // Validate JWT & get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    const zip = new JSZip();

    // Helper to fetch rows from a table and add to zip
    async function addTableToZip(table: string, filename: string, filterColumn = "user_id") {
      const { data, error } = await supabase.from(table).select("*").eq(filterColumn, userId);
      if (error) throw error;
      zip.file(filename, JSON.stringify(data, null, 2));
    }

    // Process requested options
    if (options.includes("settings")) {
      await addTableToZip("user_settings", "user_settings.json");
    }
    if (options.includes("profile")) {
      await addTableToZip("user_profiles", "user_profile.json", "id");
    }
    if (options.includes("family_trees")) {
      await addTableToZip("family_trees", "family_trees.json");
    }
    if (options.includes("people")) {
      await addTableToZip("persons", "persons.json");
    }
    if (options.includes("media")) {
      await addTableToZip("media_files", "media_files.json");
    }

    const uint8Arr = await zip.generateAsync({ type: "uint8array" });
    const base64Str = btoa(String.fromCharCode(...uint8Arr));

    return new Response(JSON.stringify({ file: base64Str }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("export-user-data error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 