import nodemailer from "nodemailer";

const isProd = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: parseInt(process.env.SMTP_PORT || "587") === 465,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  ...(isProd ? { tls: { rejectUnauthorized: true } } : {}),
});

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@davina-beauty.com";
const BRAND = "Davina Beauty";

export async function sendOrderConfirmation(to: string, orderData: any): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. Skipping order confirmation to:", to);
    return;
  }

  const items = (orderData.ordered_items || [])
    .map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>€${i.price}</td></tr>`)
    .join("");

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Order Confirmation #${orderData.order_id}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order <strong>#${orderData.order_id}</strong> has been confirmed.</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
        ${items}
      </table>
      <p><strong>Total: €${orderData.total_price}</strong></p>
      <p>Shipping: ${orderData.shipping_method || "standard"} (€${orderData.shipping_cost || 0})</p>
      <p>We will notify you when your order ships.</p>
      <br>
      <p>— ${BRAND}</p>
    `,
  });
}

export async function sendShippingNotification(to: string, orderData: any): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. Skipping shipping notification to:", to);
    return;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Your Order #${orderData.order_id} Has Shipped!`,
    html: `
      <h2>Your order is on its way!</h2>
      <p>Order <strong>#${orderData.order_id}</strong> has been shipped.</p>
      ${orderData.tracking_number ? `<p>Tracking Number: <strong>${orderData.tracking_number}</strong></p>` : ""}
      <p>Estimated delivery: 3-5 business days.</p>
      <br>
      <p>— ${BRAND}</p>
    `,
  });
}

export async function sendDeliveryConfirmation(to: string, orderData: any): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. Skipping delivery confirmation to:", to);
    return;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Order #${orderData.order_id} Delivered!`,
    html: `
      <h2>Your order has been delivered!</h2>
      <p>Order <strong>#${orderData.order_id}</strong> has been delivered.</p>
      <p>We hope you love your new beauty products!</p>
      <p>If you have a moment, we'd love to hear your thoughts — leave a review on your purchased products.</p>
      <br>
      <p>— ${BRAND}</p>
    `,
  });
}

export async function sendLowStockAlert(productName: string, stock: number): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!process.env.SMTP_USER || !adminEmail) {
    console.log(`[Email] Low stock alert: ${productName} (${stock} remaining)`);
    return;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `Low Stock Alert: ${productName}`,
    html: `
      <h2>Low Stock Warning</h2>
      <p>Product <strong>${productName}</strong> has only <strong>${stock}</strong> items remaining.</p>
      <p>Please restock soon to avoid running out.</p>
      <br>
      <p>— ${BRAND} Inventory System</p>
    `,
  });
}

export async function sendNewsletterWelcome(to: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. Skipping newsletter welcome to:", to);
    return;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to ${BRAND} Newsletter!`,
    html: `
      <h2>Welcome!</h2>
      <p>Thank you for subscribing to the ${BRAND} newsletter.</p>
      <p>You'll be the first to know about new products, exclusive offers, and beauty tips.</p>
      <br>
      <p>— ${BRAND}</p>
    `,
  });
}

/* ─────────────────────────────────────────────
   Email Verification
   ───────────────────────────────────────────── */
export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. Verification token:", token);
    return;
  }
  const APP_URL = process.env.APP_URL || "http://localhost:4200";
  const link = `${APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Verify your ${BRAND} account`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9f7f4;border-radius:12px;">
        <h2 style="font-family:Georgia,serif;color:#1a1a1a;">Welcome to ${BRAND}, ${name}!</h2>
        <p style="color:#555;">Please verify your email address to activate your account.</p>
        <a href="${link}"
          style="display:inline-block;margin:20px 0;padding:12px 28px;background:#f24901;color:#fff;border-radius:9999px;text-decoration:none;font-weight:600;">
          Verify Email Address
        </a>
        <p style="color:#888;font-size:0.85rem;">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e2dc;margin:24px 0;">
        <p style="color:#aaa;font-size:0.78rem;">— ${BRAND} Team</p>
      </div>
    `,
  });
}

/* ─────────────────────────────────────────────
   Password Reset
   ───────────────────────────────────────────── */
export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. Reset token:", token);
    return;
  }
  const APP_URL = process.env.APP_URL || "http://localhost:4200";
  const link = `${APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Reset your ${BRAND} password`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9f7f4;border-radius:12px;">
        <h2 style="font-family:Georgia,serif;color:#1a1a1a;">Password Reset</h2>
        <p style="color:#555;">Hi ${name}, we received a request to reset your password.</p>
        <a href="${link}"
          style="display:inline-block;margin:20px 0;padding:12px 28px;background:#f24901;color:#fff;border-radius:9999px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#888;font-size:0.85rem;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e2dc;margin:24px 0;">
        <p style="color:#aaa;font-size:0.78rem;">— ${BRAND} Team</p>
      </div>
    `,
  });
}

/* ─────────────────────────────────────────────
   Login OTP
   ───────────────────────────────────────────── */
export async function sendLoginOtp(to: string, name: string, otp: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured. OTP:", otp);
    return;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Your ${BRAND} login code: ${otp}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9f7f4;border-radius:12px;">
        <h2 style="font-family:Georgia,serif;color:#1a1a1a;">Login Verification</h2>
        <p style="color:#555;">Hi ${name}, use the code below to complete your login:</p>
        <div style="margin:24px 0;text-align:center;">
          <span style="font-size:2.5rem;font-weight:700;letter-spacing:0.3em;color:#f24901;background:#fff;padding:16px 32px;border-radius:12px;border:2px dashed #f24901;">
            ${otp}
          </span>
        </div>
        <p style="color:#888;font-size:0.85rem;">This code expires in <strong>5 minutes</strong>. Never share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e2dc;margin:24px 0;">
        <p style="color:#aaa;font-size:0.78rem;">— ${BRAND} Security Team</p>
      </div>
    `,
  });
}

