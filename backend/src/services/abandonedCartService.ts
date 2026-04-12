import Cart from "../models/cart";
import User from "../models/user";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@davina-skincare.com";

/**
 * Checks for carts that have been inactive for >24h and sends recovery emails.
 * Should be called periodically (e.g., every 6 hours via setInterval).
 */
export async function sendAbandonedCartEmails(): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("[AbandonedCart] SMTP not configured. Skipping.");
    return;
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: cutoff },
      ordered_items: { $exists: true, $not: { $size: 0 } },
      recovery_email_sent: { $ne: true },
    }).lean();

    console.log(`[AbandonedCart] Found ${abandonedCarts.length} abandoned carts.`);

    for (const cart of abandonedCarts) {
      try {
        const user = await User.findByPk((cart as any).user_id);
        if (!user || !(user as any).u_email) continue;

        const email = (user as any).u_email;
        const items = (cart as any).ordered_items || [];
        const itemList = items
          .map((i: any) => `<li>${i.name} (x${i.quantity}) — €${i.price}</li>`)
          .join("");

        await transporter.sendMail({
          from: FROM_EMAIL,
          to: email,
          subject: "You left something behind! 🛒",
          html: `
            <h2>Your cart is waiting for you</h2>
            <p>Hi there! You have items in your cart that you haven't checked out yet:</p>
            <ul>${itemList}</ul>
            <p><a href="http://localhost:4200/checkout" style="display:inline-block;padding:10px 24px;background:#f24901;color:#fff;text-decoration:none;border-radius:6px;">Complete Your Order</a></p>
            <p>Need help? Reply to this email or visit our support page.</p>
            <br>
            <p>— Davina Skincare</p>
          `,
        });

        // Mark as sent
        await Cart.updateOne({ _id: cart._id }, { $set: { recovery_email_sent: true } });
        console.log(`[AbandonedCart] Recovery email sent to ${email}`);
      } catch (err) {
        console.error(`[AbandonedCart] Error sending to cart ${cart._id}:`, (err as Error).message);
      }
    }
  } catch (error) {
    console.error("[AbandonedCart] Error:", (error as Error).message);
  }
}

/** Start the abandoned cart recovery scheduler */
export function startAbandonedCartScheduler(): void {
  const INTERVAL = 6 * 60 * 60 * 1000; // Every 6 hours
  console.log("[AbandonedCart] Scheduler started. Checking every 6 hours.");
  setInterval(sendAbandonedCartEmails, INTERVAL);
  // Run once on startup after a 5-minute delay
  setTimeout(sendAbandonedCartEmails, 5 * 60 * 1000);
}
