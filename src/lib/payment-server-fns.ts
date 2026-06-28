import { createServerFn } from "@tanstack/react-start";

// Generate a random order code: product code prefix + 4 random digits
function generateOrderCode(codePrefix: string): string {
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${codePrefix}${digits}`;
}

// Create a new order in the database
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      customerEmail: string;
      customerName: string;
      productKey: string;
      productTitle: string;
      codePrefix: string;
      amount: number;
      affiliateRef?: string;
      productUrl?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");

    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return { ok: false as const, error: "Server not configured" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique order code with retry
    let orderCode = "";
    let attempts = 0;
    while (attempts < 5) {
      orderCode = generateOrderCode(data.codePrefix);
      const { data: existing } = await supabase
        .from("product_orders")
        .select("id")
        .eq("order_code", orderCode)
        .single();

      if (!existing) break;
      attempts++;
    }

    if (attempts >= 5) {
      return { ok: false as const, error: "Could not generate unique order code" };
    }

    const { error } = await supabase.from("product_orders").insert({
      order_code: orderCode,
      customer_email: data.customerEmail,
      customer_name: data.customerName,
      product_key: data.productKey,
      product_title: data.productTitle,
      amount: data.amount,
      affiliate_ref: data.affiliateRef ?? null,
      product_url: data.productUrl ?? null,
    });

    if (error) {
      console.error("[createOrder]", error);
      return { ok: false as const, error: error.message };
    }

    return { ok: true as const, orderCode };
  });

// Check order status by order_code
export const checkOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { orderCode: string }) => data)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");

    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return { status: "error" as const };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error } = await supabase
      .from("product_orders")
      .select("status, paid_at")
      .eq("order_code", data.orderCode)
      .single();

    if (error || !order) {
      return { status: "error" as const };
    }

    return {
      status: order.status as "pending" | "paid" | "cancelled",
      paidAt: order.paid_at,
    };
  });

export const uploadAvatarServer = createServerFn({ method: "POST" })
  .inputValidator((data: { affiliateId: string; displayName: string; avatarBase64?: string; avatarExt?: string }) => data)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!supabaseUrl || !supabaseServiceKey) return { ok: false as const, error: "Server not configured" };

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let avatarUrl: string | null = null;

    if (data.avatarBase64 && data.avatarExt) {
      const buffer = Buffer.from(data.avatarBase64, "base64");
      const path = `${data.affiliateId}.${data.avatarExt}`;
      const contentType = data.avatarExt === "png" ? "image/png" : data.avatarExt === "webp" ? "image/webp" : "image/jpeg";

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, buffer, { upsert: true, contentType });

      if (uploadErr) return { ok: false as const, error: uploadErr.message };

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = urlData.publicUrl + "?t=" + Date.now();
    }

    const updateData: Record<string, any> = { display_name: data.displayName };
    if (avatarUrl) updateData.avatar_url = avatarUrl;

    const { error } = await supabase.from("affiliates").update(updateData).eq("id", data.affiliateId);
    if (error) return { ok: false as const, error: error.message };

    return { ok: true as const, avatarUrl };
  });

export const getLeaderboardServer = createServerFn({ method: "POST" })
  .handler(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!supabaseUrl || !supabaseServiceKey) return [];

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase.rpc("get_leaderboard");
    if (!data || data.length === 0) return [];

    const ids = data.map((d: any) => d.affiliate_id);
    const { data: profiles } = await supabase
      .from("affiliates")
      .select("id, display_name, avatar_url")
      .in("id", ids);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    return data.map((d: any) => {
      const p = profileMap.get(d.affiliate_id);
      return { ...d, display_name: p?.display_name || null, avatar_url: p?.avatar_url || null };
    });
  });

export const deleteMemberServer = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!supabaseUrl || !supabaseServiceKey) return { ok: false, error: "Server not configured" };

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("affiliate_clicks").delete().eq("affiliate_id", data.userId);
    await supabase.from("affiliate_orders").delete().eq("affiliate_id", data.userId);
    await supabase.from("affiliates").delete().eq("user_id", data.userId);
    await supabase.from("user_roles").delete().eq("user_id", data.userId);
    await supabase.from("product_orders").delete().eq("customer_email", data.userId);
    await supabase.from("profiles").delete().eq("id", data.userId);
    await supabase.auth.admin.deleteUser(data.userId);

    return { ok: true };
  });
