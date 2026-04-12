import { Request, Response } from "express";
import { Roles } from "../enums/role.enum";
import Payment from "../models/payment";
import Order from "../models/order";
import Cart from "../models/cart";
import ProductItem from "../models/productItems";
import User from "../models/user";
import Coupon from "../models/coupon";
import { StatusOrder, StatusPayment, ShippingMethod, SHIPPING_COSTS, TAX_RATE } from "../enums/status.enum";
import { sendOrderConfirmation, sendLowStockAlert } from "../services/emailService";
import { generateInvoicePdf } from "../services/invoiceService";
import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

function paystackHeaders() {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

const VALID_PAYMENT_METHODS = ['cash_on_delivery', 'paystack', 'bank_transfer', 'momo', 'airtel'];

async function makePayment(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { payment_method, shipping_method, order_notes, coupon_code, shipping_address_id } = req.body;

    if (!payment_method || !VALID_PAYMENT_METHODS.includes(payment_method)) {
      res.status(400).json({ message: "Please select a valid payment method: " + VALID_PAYMENT_METHODS.join(', ') });
      return;
    }

    const cart = await Cart.findOne({ user_id: userId });

    if (!cart || cart.ordered_items.length === 0) {
      res.status(400).json({ message: "Your cart is empty. Please add some items before checking out." });
      return;
    }

    // Check stock availability for all items
    for (const item of cart.ordered_items) {
      const product = await ProductItem.findById(item.product_id);
      if (!product) {
        res.status(400).json({ message: `Product ${item.product_id} not found.` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ message: `Sorry, the product "${product.p_name}" only has ${product.stock} items left in stock.` });
        return;
      }
    }

    // Decrement stock and check for low stock alerts
    for (const item of cart.ordered_items) {
      const updated = await ProductItem.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (updated && updated.stock <= 5) {
        sendLowStockAlert(updated.p_name, updated.stock).catch(() => {});
      }
    }

    // Calculate shipping
    const shipMethod = (shipping_method && Object.values(ShippingMethod).includes(shipping_method))
      ? shipping_method as ShippingMethod
      : ShippingMethod.STANDARD;
    const shippingCost = SHIPPING_COSTS[shipMethod];

    // Calculate discount from coupon
    let discountAmount = 0;
    if (coupon_code) {
      const coupon = await Coupon.findOne({ code: coupon_code.toUpperCase(), active: true });
      if (coupon && coupon.expires_at > new Date() && (coupon.max_uses === 0 || coupon.used_count < coupon.max_uses)) {
        if (coupon.discount_type === "percentage") {
          discountAmount = cart.total_price * (coupon.discount_value / 100);
        } else {
          discountAmount = coupon.discount_value;
        }
        discountAmount = Math.min(discountAmount, cart.total_price);
        coupon.used_count += 1;
        await coupon.save();
      }
    }

    // Calculate tax and final total
    const subtotal = cart.total_price - discountAmount;
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
    const totalPrice = Math.round((subtotal + taxAmount + shippingCost) * 100) / 100;

    // Determine initial payment status based on method
    let paymentStatus = StatusPayment.PENDING;
    let paystackReference: string | null = null;
    let paystackAuthUrl: string | null = null;
    let paystackAccessCode: string | null = null;
    let momoTransactionId: string | null = null;

    // Fetch user email for Paystack
    const user = await User.findByPk(userId);
    const userEmail = user?.u_email || "";

    if (payment_method === 'cash_on_delivery') {
      paymentStatus = StatusPayment.PENDING;
    } else if (payment_method === 'paystack') {
      // Paystack transaction initialization
      if (!PAYSTACK_SECRET_KEY) {
        res.status(500).json({ message: "Online payment is currently unavailable. Please try another payment method." });
        return;
      }
      try {
        const paystackRes = await axios.post(
          `${PAYSTACK_BASE_URL}/transaction/initialize`,
          {
            email: userEmail,
            amount: Math.round(totalPrice * 100), // Paystack expects kobo/cents
            currency: "NGN",
            metadata: { user_id: String(userId) },
            callback_url: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:4200/checkout/callback",
          },
          { headers: paystackHeaders() }
        );
        if (!paystackRes.data.status) {
          res.status(500).json({ message: "We couldn't start your payment. Please try again or choose a different payment method." });
          return;
        }
        paystackReference = paystackRes.data.data.reference;
        paystackAuthUrl = paystackRes.data.data.authorization_url;
        paystackAccessCode = paystackRes.data.data.access_code;
        paymentStatus = StatusPayment.PENDING;
      } catch (paystackErr: any) {
        console.error("Paystack error:", paystackErr.response?.data || paystackErr.message);
        res.status(500).json({ message: "Payment could not be processed. Please try again or choose a different payment method." });
        return;
      }
    } else if (payment_method === 'momo') {
      // MoMo Mobile Money — initiate payment request
      const { momo_phone } = req.body;
      if (!momo_phone) {
        res.status(400).json({ message: "Please enter your MoMo phone number to continue." });
        return;
      }
      try {
        // MoMo API call structure (uses MTN MoMo Open API pattern)
        const momoApiUrl = process.env.MOMO_API_URL || "https://sandbox.momodeveloper.mtn.com";
        const momoApiKey = process.env.MOMO_API_KEY || "";
        const momoApiUser = process.env.MOMO_API_USER || "";
        const { v4: uuidv4 } = await import("uuid");
        const referenceId = uuidv4();

        if (momoApiKey && momoApiUser) {
          const axios = (await import("axios")).default;
          await axios.post(
            `${momoApiUrl}/collection/v1_0/requesttopay`,
            {
              amount: String(totalPrice),
              currency: "EUR",
              externalId: referenceId,
              payer: { partyIdType: "MSISDN", partyId: momo_phone },
              payerMessage: "Davina Skincare Order",
              payeeNote: "Payment for order",
            },
            {
              headers: {
                "X-Reference-Id": referenceId,
                "X-Target-Environment": process.env.MOMO_ENVIRONMENT || "sandbox",
                "Ocp-Apim-Subscription-Key": momoApiKey,
                Authorization: `Bearer ${momoApiUser}`,
                "Content-Type": "application/json",
              },
            }
          );
          momoTransactionId = referenceId;
        } else {
          // Sandbox/demo mode — simulated
          momoTransactionId = `MOMO_SIM_${Date.now()}`;
          console.log("[MoMo] Simulated payment for demo:", momoTransactionId);
        }
        paymentStatus = StatusPayment.PENDING; // Confirmed via callback/webhook
      } catch (momoErr: any) {
        console.error("MoMo error:", momoErr.message);
        res.status(500).json({ message: "We couldn't connect to MoMo. Please try again or choose a different payment method." });
        return;
      }
    } else if (payment_method === 'airtel') {
      // Airtel Money — initiate payment request
      const { airtel_phone } = req.body;
      if (!airtel_phone) {
        res.status(400).json({ message: "Please enter your Airtel phone number to continue." });
        return;
      }
      try {
        const airtelApiUrl = process.env.AIRTEL_API_URL || "https://openapiuat.airtel.africa";
        const airtelClientId = process.env.AIRTEL_CLIENT_ID || "";
        const airtelClientSecret = process.env.AIRTEL_CLIENT_SECRET || "";

        if (airtelClientId && airtelClientSecret) {
          const axios = (await import("axios")).default;
          // Get auth token
          const tokenRes = await axios.post(`${airtelApiUrl}/auth/oauth2/token`, {
            client_id: airtelClientId,
            client_secret: airtelClientSecret,
            grant_type: "client_credentials",
          });
          const accessToken = tokenRes.data.access_token;

          const { v4: uuidv4 } = await import("uuid");
          const txnRef = uuidv4();
          await axios.post(
            `${airtelApiUrl}/merchant/v1/payments/`,
            {
              reference: txnRef,
              subscriber: { country: "UG", currency: "EUR", msisdn: airtel_phone },
              transaction: { amount: totalPrice, country: "UG", currency: "EUR", id: txnRef },
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          momoTransactionId = txnRef;
        } else {
          // Sandbox/demo mode
          momoTransactionId = `AIRTEL_SIM_${Date.now()}`;
          console.log("[Airtel] Simulated payment for demo:", momoTransactionId);
        }
        paymentStatus = StatusPayment.PENDING;
      } catch (airtelErr: any) {
        console.error("Airtel error:", airtelErr.message);
        res.status(500).json({ message: "We couldn't connect to Airtel Money. Please try again or choose a different payment method." });
        return;
      }
    } else if (payment_method === 'bank_transfer') {
      paymentStatus = StatusPayment.PENDING; // Manual confirmation
    }

    const newOrder = await Order.create({
      user_id: userId,
      total_price: totalPrice,
      status: StatusOrder.PENDING,
      ordered_items: cart.ordered_items,
      shipping_method: shipMethod,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      order_notes: order_notes || null,
      coupon_code: coupon_code || null,
      discount_amount: discountAmount,
      shipping_address_id: shipping_address_id || null,
    });

    const payment = await Payment.create({
      order_id: newOrder.order_id,
      amount: newOrder.total_price,
      payment_method,
      status: paymentStatus,
      ...(paystackReference && { paystack_reference: paystackReference }),
      ...(momoTransactionId && { mobile_money_transaction_id: momoTransactionId }),
    });

    cart.ordered_items = [];
    cart.total_price = 0;
    cart.coupon_code = undefined;
    cart.discount_amount = 0;
    await cart.save();

    // Send order confirmation email
    try {
      if (user) {
        sendOrderConfirmation(user.u_email, newOrder).catch(() => {});
      }
    } catch (_) {}

    res.status(201).json({
      message: "Payment completed successfully and order created.",
      order: newOrder,
      payment,
      ...(paystackAuthUrl && { paystack_authorization_url: paystackAuthUrl }),
      ...(paystackReference && { paystack_reference: paystackReference }),
      ...(paystackAccessCode && { paystack_access_code: paystackAccessCode }),
      ...(momoTransactionId && { mobile_money_transaction_id: momoTransactionId }),
    });
  } catch (error) {
    console.error("Payment error:", (error as Error).message);
    res.status(500).json({ error: "Something went wrong with your payment. Please try again." });
  }
}

async function getPayments(req: Request, res: Response): Promise<void> {
  try {
    const { role, userId } = (req as any).user;

    let payments;
    if (role === Roles.ADMIN) {
      payments = await Payment.findAll({ include: Order });
    } else {
      payments = await Payment.findAll({
        include: {
          model: Order,
          where: { user_id: userId },
        },
      });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", (error as Error).message);
    res.status(500).json({ error: "We couldn't load your payment history. Please try again later." });
  }
}

async function getPaymentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      res.status(404).json({ message: "Payment not found." });
      return;
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error in getPaymentById:", (error as Error).message);
    res.status(500).json({ error: "Error fetching payment." });
  }
}

async function processRefund(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      res.status(404).json({ message: "Payment not found." });
      return;
    }

    if (payment.status !== StatusPayment.PAID) {
      res.status(400).json({ message: "This payment cannot be refunded because it hasn't been completed yet." });
      return;
    }

    await payment.update({
      status: StatusPayment.REFUNDED,
      refund_amount: payment.amount,
      refund_reason: reason || "Customer requested refund",
    });

    // Update order status
    await Order.update(
      { status: StatusOrder.CANCELLED },
      { where: { order_id: payment.order_id } }
    );

    res.status(200).json({ message: "Refund processed.", data: payment });
  } catch (error) {
    console.error("Error processing refund:", (error as Error).message);
    res.status(500).json({ error: "Failed to process refund." });
  }
}

async function getInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    // Check authorization
    const { role } = (req as any).user;
    if (role !== Roles.ADMIN && order.user_id !== userId) {
      res.status(403).json({ message: "Not authorized." });
      return;
    }

    const user = await User.findByPk(order.user_id);
    generateInvoicePdf(res, order, user?.u_name || "Customer", user?.u_email || "");
  } catch (error) {
    console.error("Error generating invoice:", (error as Error).message);
    res.status(500).json({ error: "We couldn't generate your invoice. Please try again later." });
  }
}

/**
 * Verify a Paystack transaction after payment is completed.
 * Called by the frontend after redirect from Paystack checkout.
 */
async function verifyPaystackPayment(req: Request, res: Response): Promise<void> {
  try {
    const { reference } = req.body;
    if (!reference) {
      res.status(400).json({ message: "reference is required." });
      return;
    }
    if (!PAYSTACK_SECRET_KEY) {
      res.status(500).json({ message: "Paystack is not configured." });
      return;
    }

    const verifyRes = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: paystackHeaders() }
    );

    const data = verifyRes.data.data;
    if (data.status === "success") {
      const payment = await Payment.findOne({
        where: { paystack_reference: reference },
      });
      if (payment) {
        await payment.update({ status: StatusPayment.PAID });
        await Order.update(
          { status: StatusOrder.CONFIRMED },
          { where: { order_id: payment.order_id } }
        );
      }
      res.status(200).json({ message: "Payment verified.", status: "success" });
    } else {
      res.status(200).json({ message: "Payment not yet confirmed.", status: data.status });
    }
  } catch (error) {
    console.error("Paystack verify error:", (error as Error).message);
    res.status(500).json({ error: "Failed to verify Paystack payment." });
  }
}

/**
 * Paystack webhook handler — receives events from Paystack.
 * Verifies signature using HMAC SHA-512.
 */
async function paystackWebhook(req: Request, res: Response): Promise<void> {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      res.status(500).json({ message: "Paystack not configured." });
      return;
    }

    // Verify Paystack webhook signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");
    const signature = req.headers["x-paystack-signature"] as string;

    if (hash !== signature) {
      res.status(400).json({ message: "Invalid webhook signature." });
      return;
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const payment = await Payment.findOne({
        where: { paystack_reference: reference },
      });
      if (payment) {
        await payment.update({ status: StatusPayment.PAID });
        await Order.update(
          { status: StatusOrder.CONFIRMED },
          { where: { order_id: payment.order_id } }
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", (error as Error).message);
    res.status(400).json({ error: "Webhook error." });
  }
}

/**
 * Check MoMo/Airtel transaction status (polling endpoint for frontend)
 */
async function checkMomoStatus(req: Request, res: Response): Promise<void> {
  try {
    const { transaction_id } = req.params;
    if (!transaction_id) {
      res.status(400).json({ message: "transaction_id is required." });
      return;
    }

    // Check if it's a simulated transaction
    if (transaction_id.startsWith("MOMO_SIM_") || transaction_id.startsWith("AIRTEL_SIM_")) {
      // In demo mode, auto-confirm after creation
      const payment = await Payment.findOne({
        where: { mobile_money_transaction_id: transaction_id },
      });
      if (payment) {
        await payment.update({ status: StatusPayment.PAID });
        await Order.update(
          { status: StatusOrder.CONFIRMED },
          { where: { order_id: payment.order_id } }
        );
      }
      res.status(200).json({ status: "SUCCESSFUL", transaction_id });
      return;
    }

    // Real MoMo API status check
    const momoApiUrl = process.env.MOMO_API_URL || "https://sandbox.momodeveloper.mtn.com";
    const momoApiKey = process.env.MOMO_API_KEY || "";
    if (momoApiKey) {
      const axios = (await import("axios")).default;
      const statusRes = await axios.get(
        `${momoApiUrl}/collection/v1_0/requesttopay/${transaction_id}`,
        {
          headers: {
            "X-Target-Environment": process.env.MOMO_ENVIRONMENT || "sandbox",
            "Ocp-Apim-Subscription-Key": momoApiKey,
          },
        }
      );
      const status = statusRes.data.status;
      if (status === "SUCCESSFUL") {
        const payment = await Payment.findOne({
          where: { mobile_money_transaction_id: transaction_id },
        });
        if (payment) {
          await payment.update({ status: StatusPayment.PAID });
          await Order.update(
            { status: StatusOrder.CONFIRMED },
            { where: { order_id: payment.order_id } }
          );
        }
      }
      res.status(200).json({ status, transaction_id });
    } else {
      res.status(200).json({ status: "PENDING", transaction_id });
    }
  } catch (error) {
    console.error("MoMo status check error:", (error as Error).message);
    res.status(500).json({ error: "Failed to check payment status." });
  }
}

export { makePayment, getPayments, getPaymentById, processRefund, getInvoice, verifyPaystackPayment, paystackWebhook, checkMomoStatus };
