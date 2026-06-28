// Nitro API route: POST /api/sepay-webhook
// Receives payment notifications from SePay and processes them

import { defineEventHandler, readBody } from "h3";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
import nodemailer from "nodemailer";

// Product email content mapping (by product number/key)
const productEmailContent: Record<string, { subject: string; body: string }> = {
  LOVA: {
    subject: "San pham: Huong dan tao Landing Page — Thinh Vua App",
    body: `<h2>Huong dan tao Landing Page (Web), Trang ban hang</h2>
<p>Cam on ban da mua san pham! Duoi day la huong dan truy cap:</p>
<ul><li>Tai lieu huong dan chi tiet tu A-Z</li><li>Lien he Zalo <b>0367337799</b> de nhan link truy cap</li></ul>`,
  },
  GPT: {
    subject: "San pham: Quy trinh tao Poster + ChatGPT Plus — Thinh Vua App",
    body: `<h2>Quy trinh tao Poster + Free ChatGPT Plus + Kho Poster mau</h2>
<p>Cam on ban da mua san pham!</p>
<ul><li>Tron bo quy trinh tao poster chuyen nghiep</li><li>Trai nghiem ChatGPT Plus mien phi</li><li>Kho poster mau da nganh nghe</li><li>Lien he Zalo <b>0367337799</b> de nhan link truy cap</li></ul>`,
  },
  KN: {
    subject: "San pham: Cong dong khoi nghiep cung AI — Thinh Vua App",
    body: `<h2>Gioi thieu Thinh Vua App & Cong dong khoi nghiep cung AI</h2>
<p>Cam on ban da mua san pham!</p>
<ul><li>Lien he Zalo <b>0367337799</b> de tham gia cong dong</li></ul>`,
  },
  GPT2: {
    subject: "San pham: Full quy trinh ChatGPT Image 2 — Thinh Vua App",
    body: `<h2>Full quy trinh kiem 100TR moi thang voi ChatGPT Image 2</h2>
<p>Cam on ban da mua san pham!</p>
<ul><li>Tron bo quy trinh thuc chien</li><li>Lien he Zalo <b>0367337799</b> de nhan tai lieu</li></ul>`,
  },
  TLA: {
    subject: "San pham: 100+ Tro ly AI — Thinh Vua App",
    body: `<h2>Qua tang 100+ Tro ly AI cho du cac nganh nghe</h2><p>Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  },
  APP: {
    subject: "San pham: 50+ App AI — Thinh Vua App",
    body: `<h2>Qua tang 50+ App AI phuc vu du cac nganh nghe</h2><p>Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  },
  TLAP: {
    subject: "San pham: Combo 100+ Tro ly + 50+ App — Thinh Vua App",
    body: `<h2>Combo 100+ Tro ly AI + 50+ App</h2><p>Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  },
  FLOW: {
    subject: "San pham: Build App tren Google Flow — Thinh Vua App",
    body: `<h2>Full tai lieu Build App tren Google Flow tu A-Z</h2><p>Lien he Zalo <b>0367337799</b> de nhan tai lieu.</p>`,
  },
  WMP: {
    subject: "San pham: App WF-Nganh My Pham — Thinh Vua App",
    body: `<h2>App WF-Nganh My Pham</h2><p>Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  },
  FKOL: {
    subject: "San pham: App AF-Tao KOL AI — Thinh Vua App",
    body: `<h2>App AF-Tao KOL AI</h2><p>Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  },
  FTVA: {
    subject: "San pham: App FL-Thinh Vua App — Thinh Vua App",
    body: `<h2>App FL-Thinh Vua App</h2><p>Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  },
};

async function sendProductEmail(
  to: string,
  customerName: string,
  productKey: string,
  productUrl?: string | null
): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER ?? "";
  const gmailPass = process.env.GMAIL_APP_PASSWORD ?? "";

  if (!gmailUser || !gmailPass) {
    console.error("[sepay-webhook] Missing GMAIL_USER or GMAIL_APP_PASSWORD");
    return false;
  }

  const emailContent = productEmailContent[productKey] ?? {
    subject: `Xac nhan thanh toan — Thinh Vua App`,
    body: `<p>Cam on ban da thanh toan! Lien he Zalo <b>0367337799</b> de nhan san pham.</p>`,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:linear-gradient(135deg,#e94560,#ff6b6b);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">THINH VUA APP</h1>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p>Xin chao <b>${customerName}</b>,</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
          <p style="color:#16a34a;font-size:18px;font-weight:bold;margin:0;">Thanh toan thanh cong!</p>
        </div>
        ${emailContent.body}
        ${productUrl ? `
        <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
          <p style="font-weight:bold;margin:0 0 8px 0;">🔓 Link sản phẩm của bạn:</p>
          <a href="${productUrl}" style="display:inline-block;background:#e94560;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:16px;">👉 Truy cập sản phẩm ngay</a>
          <p style="font-size:12px;color:#666;margin:8px 0 0 0;">${productUrl}</p>
        </div>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="color:#888;font-size:12px;text-align:center;">
          &copy; Thinh Vua App &mdash; AIGO Group<br>
          Hotline/Zalo: 0367337799
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Thinh Vua App" <${gmailUser}>`,
      to,
      subject: emailContent.subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("[sepay-webhook] Email send error:", err);
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log("[sepay-webhook] Received:", JSON.stringify(body));

  // SePay sends: { transferType, content, transferAmount, ... }
  // We only care about incoming transfers
  if (!body || body.transferType !== "in") {
    return { success: true, message: "Ignored (not incoming transfer)" };
  }

  const content = (body.content ?? "").toString().trim().toUpperCase();
  const transferAmount = Number(body.transferAmount ?? 0);

  if (!content || !transferAmount) {
    return { success: true, message: "Ignored (no content or amount)" };
  }

  // Connect to Supabase with service role
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[sepay-webhook] Missing Supabase env vars");
    return { success: false, message: "Server not configured" };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Try to find a matching pending order
  // The transfer content from SePay may contain extra text, so we search
  // for any pending order whose order_code appears in the content
  const { data: pendingOrders, error: fetchError } = await supabase
    .from("product_orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("[sepay-webhook] DB fetch error:", fetchError);
    return { success: false, message: "DB error" };
  }

  // Find matching order: content contains the order_code
  const matchedOrder = pendingOrders?.find((order) => {
    const orderCodeUpper = order.order_code.toUpperCase();
    return content.includes(orderCodeUpper);
  });

  if (!matchedOrder) {
    console.log("[sepay-webhook] No matching order for content:", content);
    return { success: true, message: "No matching order" };
  }

  // Verify amount matches (in VND)
  if (transferAmount < matchedOrder.amount) {
    console.log(
      `[sepay-webhook] Amount mismatch: received ${transferAmount}, expected ${matchedOrder.amount}`
    );
    return {
      success: true,
      message: `Amount mismatch: got ${transferAmount}, need ${matchedOrder.amount}`,
    };
  }

  // Update order to paid
  const { error: updateError } = await supabase
    .from("product_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", matchedOrder.id);

  if (updateError) {
    console.error("[sepay-webhook] Update error:", updateError);
    return { success: false, message: "Update failed" };
  }

  console.log(`[sepay-webhook] Order ${matchedOrder.order_code} marked as PAID`);

  // Auto-create affiliate record for buyer after first purchase
  if (matchedOrder.customer_email) {
    const { data: existingAff } = await supabase
      .from("affiliates")
      .select("id")
      .eq("email", matchedOrder.customer_email)
      .maybeSingle();

    if (!existingAff) {
      const namePart = matchedOrder.customer_name || matchedOrder.customer_email.split("@")[0] || "";
      const baseCode = namePart.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "user";
      const refCode = baseCode + Math.floor(Math.random() * 9000 + 1000);

      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const matchedUser = authUsers?.users?.find((u: any) => u.email === matchedOrder.customer_email);

      const { error: createAffErr } = await supabase.from("affiliates").insert({
        user_id: matchedUser?.id || null,
        ref_code: refCode,
        full_name: namePart,
        email: matchedOrder.customer_email,
        phone: "",
        commission_rate: 35,
        status: "active",
        referred_by: matchedOrder.affiliate_ref || null,
      });

      if (createAffErr) {
        console.error("[sepay-webhook] Auto-create affiliate error:", createAffErr);
      } else {
        console.log(`[sepay-webhook] Auto-created affiliate for ${matchedOrder.customer_email} ref=${refCode}`);
      }
    }
  }

  // Create affiliate commission for referrer
  if (matchedOrder.customer_email) {
    // Find the buyer's affiliate record to get their referrer
    const { data: buyerAff } = await supabase
      .from("affiliates")
      .select("referred_by")
      .eq("email", matchedOrder.customer_email)
      .maybeSingle();

    const referrerCode = buyerAff?.referred_by || matchedOrder.affiliate_ref;

    if (referrerCode) {
      const { data: referrerAff } = await supabase
        .from("affiliates")
        .select("id, commission_rate")
        .eq("ref_code", referrerCode)
        .maybeSingle();

      if (referrerAff) {
        const commissionRate = referrerAff.commission_rate || 35;
        const commissionAmount = Math.round(matchedOrder.amount * commissionRate / 100);

        const { error: affOrderErr } = await supabase.from("affiliate_orders").insert({
          affiliate_id: referrerAff.id,
          customer_name: matchedOrder.customer_name || "",
          customer_email: matchedOrder.customer_email || "",
          customer_phone: "",
          product_title: matchedOrder.product_title || matchedOrder.product_key,
          amount: String(matchedOrder.amount),
          commission_amount: commissionAmount,
          commission_status: "pending",
          status: "confirmed",
        });

        if (affOrderErr) {
          console.error("[sepay-webhook] Affiliate order insert error:", affOrderErr);
        } else {
          console.log(`[sepay-webhook] Affiliate commission ${commissionAmount}đ for referrer=${referrerCode}`);
        }
      }
    }
  }

  // Send email to customer
  if (matchedOrder.customer_email) {
    const emailSent = await sendProductEmail(
      matchedOrder.customer_email,
      matchedOrder.customer_name ?? "bạn",
      matchedOrder.product_key,
      matchedOrder.product_url
    );

    // Update email_sent flag
    await supabase
      .from("product_orders")
      .update({ email_sent: emailSent })
      .eq("id", matchedOrder.id);

    console.log(
      `[sepay-webhook] Email ${emailSent ? "sent" : "failed"} for order ${matchedOrder.order_code}`
    );
  }

  return { success: true, message: "Order paid and processed" };
});
