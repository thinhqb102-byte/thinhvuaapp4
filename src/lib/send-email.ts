import { createServerFn } from "@tanstack/react-start";

export const sendProductEmail = createServerFn({ method: "POST" })
  .validator((data: { to: string; subject: string; html: string; customerName: string }) => data)
  .handler(async ({ data }) => {
    const nodemailer = await import("nodemailer");

    const user = process.env.GMAIL_USER ?? import.meta.env.VITE_GMAIL_USER ?? "";
    const pass = process.env.GMAIL_APP_PASSWORD ?? import.meta.env.VITE_GMAIL_APP_PASSWORD ?? "";

    if (!user || !pass) {
      console.error("[send-email] Missing GMAIL_USER or GMAIL_APP_PASSWORD");
      return { ok: false, error: "Email not configured" };
    }

    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#e94560,#ff6b6b);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">THỊNH VUA APP</h1>
        </div>
        <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
          <p>Xin chào <b>${data.customerName}</b>,</p>
          ${data.html}
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="color:#888;font-size:12px;text-align:center;">
            © Thịnh Vua App — AIGO Group<br>
            Hotline/Zalo: 0367337799
          </p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Thịnh Vua App" <${user}>`,
        to: data.to,
        subject: data.subject,
        html,
      });
      return { ok: true };
    } catch (err) {
      console.error("[send-email]", err);
      return { ok: false, error: String(err) };
    }
  });
