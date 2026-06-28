// Server-only email sender utility using nodemailer
// Works in both createServerFn handlers and Nitro API routes

// @ts-ignore - nodemailer has no type declarations in this project
import nodemailer from "nodemailer";

function getEmailConfig() {
  const user = process.env.GMAIL_USER ?? "";
  const pass = process.env.GMAIL_APP_PASSWORD ?? "";
  return { user, pass };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  customerName: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { user, pass } = getEmailConfig();

  if (!user || !pass) {
    console.error("[email-sender] Missing GMAIL_USER or GMAIL_APP_PASSWORD");
    return { ok: false, error: "Email not configured" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:linear-gradient(135deg,#e94560,#ff6b6b);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">THINH VUA APP</h1>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p>Xin chao <b>${opts.customerName}</b>,</p>
        ${opts.html}
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
      from: `"Thinh Vua App" <${user}>`,
      to: opts.to,
      subject: opts.subject,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("[email-sender]", err);
    return { ok: false, error: String(err) };
  }
}
