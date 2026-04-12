import { Request, Response } from "express";
import Order from "../models/order";
import Cart from "../models/cart";
import User from "../models/user";
import { Roles } from "../enums/role.enum";
import { StatusCart, StatusOrder } from "../enums/status.enum";
import { calculateTotal } from "../utils/calculateTotal";
import { sendShippingNotification, sendDeliveryConfirmation, sendOrderConfirmation } from "../services/emailService";
import ProductItem from "../models/productItems";

async function createOrderFromCart(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    const cart = await Cart.findOne({ user_id });
    if (!cart || cart.ordered_items.length === 0) {
      res.status(400).json({ message: "Your cart is empty." });
      return;
    }

    const { total_price, processedItems } = await calculateTotal(
      cart.ordered_items
    );

    const order = await Order.create({
      user_id,
      ordered_items: processedItems,
      total_price,
      status: StatusOrder.PENDING,
    });

    cart.ordered_items = [];
    cart.total_price = 0;
    cart.status = StatusCart.EXPIRED;
    await cart.save();

    res.status(201).json({
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error("createOrderFromCart ERROR:", (error as Error).message);
    res
      .status(500)
      .json({ error: "Internal error while creating the order." });
  }
}

async function getOrdersByUser(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    const orders = await Order.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("getOrdersByUser ERROR:", (error as Error).message);
    res.status(500).json({ error: "Error loading orders." });
  }
}

async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { status, tracking_number } = req.body;

    if ((req as any).user.role !== Roles.ADMIN) {
      res.status(403).json({ message: "Only admins can change the status." });
      return;
    }

    if (!Object.values(StatusOrder).includes(status)) {
      res.status(400).json({
        message: `Invalid status. Allowed values: ${Object.values(StatusOrder).join(", ")}`,
      });
      return;
    }

    const updateData: any = { status };
    if (tracking_number) {
      updateData.tracking_number = tracking_number;
    }

    const updated = await Order.update(
      updateData,
      { where: { order_id: orderId } }
    );

    if (updated[0] === 0) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    // Send email notifications on status changes
    try {
      const order = await Order.findByPk(orderId);
      if (order) {
        const user = await User.findByPk(order.user_id);
        if (user) {
          if (status === StatusOrder.SHIPPED) {
            sendShippingNotification(user.u_email, order).catch(() => {});
          } else if (status === StatusOrder.DELIVERED) {
            sendDeliveryConfirmation(user.u_email, order).catch(() => {});
          }
        }
      }
    } catch (_) {}

    res.status(200).json({ message: "Status updated successfully." });
  } catch (error) {
    console.error("updateOrderStatus ERROR:", (error as Error).message);
    res.status(500).json({ error: "Status could not be updated." });
  }
}

async function deleteOrder(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    const user = (req as any).user;
    if (user.role !== Roles.ADMIN && user.userId !== order.user_id) {
      res
        .status(403)
        .json({ message: "You don't have permission to delete this order." });
      return;
    }

    await order.destroy();
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("deleteOrder ERROR:", (error as Error).message);
    res.status(500).json({ error: "Error deleting order." });
  }
}

async function getAllOrders(_req: Request, res: Response): Promise<void> {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("getAllOrders ERROR:", (error as Error).message);
    res.status(500).json({ error: "Error loading orders." });
  }
}

/** Guest checkout — no login required */
async function createGuestOrder(req: Request, res: Response): Promise<void> {
  try {
    const { customerInfo, items } = req.body;

    if (!customerInfo?.email || !items?.length) {
      res.status(400).json({ message: "Customer email and order items are required." });
      return;
    }

    // Build ordered items from product DB
    const orderedItems: any[] = [];
    for (const item of items) {
      const product = await ProductItem.findById(item.product_id);
      if (!product) continue;
      orderedItems.push({
        product_id: item.product_id,
        name: product.p_name,
        quantity: item.quantity,
        price: product.price,
        image: product.image_url || "",
      });
    }

    if (orderedItems.length === 0) {
      res.status(400).json({ message: "None of the products in your order could be found. Please try again." });
      return;
    }

    const subtotal = orderedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCosts: Record<string, number> = { standard: 4.99, express: 9.99, overnight: 19.99, free: 0 };
    const shippingCost = shippingCosts[customerInfo.shipping_method] ?? 4.99;
    const taxAmount = subtotal * 0.19;
    const totalPrice = subtotal + shippingCost + taxAmount;

    // Use logged-in user_id if available, otherwise 0 for guest
    const userId = (req as any).user?.userId || 0;

    const order = await Order.create({
      user_id: userId,
      ordered_items: orderedItems,
      total_price: totalPrice,
      shipping_method: customerInfo.shipping_method || "standard",
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      order_notes: customerInfo.order_notes || "",
      status: StatusOrder.PENDING,
    });

    // Send confirmation email
    await sendOrderConfirmation(customerInfo.email, order.toJSON()).catch(() => {});

    res.status(201).json({ message: "Guest order created.", data: order });
  } catch (error) {
    console.error("Guest order error:", (error as Error).message);
    res.status(500).json({ error: "Something went wrong while placing your order. Please try again." });
  }
}

/** Retrieve shipment tracking info for an order */
async function getTrackingInfo(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { userId, role } = (req as any).user;

    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    // Only the owner or admin can see tracking
    if (role !== Roles.ADMIN && order.user_id !== userId) {
      res.status(403).json({ message: "Not authorized." });
      return;
    }

    // Build tracking timeline based on status
    const timeline: { status: string; label: string; date: string | null; active: boolean }[] = [
      { status: StatusOrder.PENDING, label: "Order Placed", date: String(order.createdAt), active: true },
      { status: StatusOrder.CONFIRMED, label: "Confirmed", date: null, active: false },
      { status: StatusOrder.SHIPPED, label: "Shipped", date: null, active: false },
      { status: StatusOrder.DELIVERED, label: "Delivered", date: null, active: false },
    ];

    const statusOrder = [StatusOrder.PENDING, StatusOrder.CONFIRMED, StatusOrder.SHIPPED, StatusOrder.DELIVERED];
    const currentIdx = statusOrder.indexOf(order.status as StatusOrder);
    for (let i = 0; i <= currentIdx && i < timeline.length; i++) {
      timeline[i].active = true;
      if (i === currentIdx) {
        timeline[i].date = String(order.updatedAt);
      }
    }

    res.status(200).json({
      order_id: order.order_id,
      status: order.status,
      tracking_number: order.tracking_number || null,
      shipping_method: order.shipping_method,
      estimated_delivery: getEstimatedDelivery(order.shipping_method, order.createdAt),
      timeline,
    });
  } catch (error) {
    console.error("getTrackingInfo ERROR:", (error as Error).message);
    res.status(500).json({ error: "Could not retrieve tracking info." });
  }
}

function getEstimatedDelivery(method: string, orderDate: Date): string {
  const date = new Date(orderDate);
  switch (method) {
    case "express": date.setDate(date.getDate() + 3); break;
    case "overnight": date.setDate(date.getDate() + 1); break;
    default: date.setDate(date.getDate() + 7); break;
  }
  return date.toISOString();
}

export {
  createOrderFromCart,
  createGuestOrder,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
  getAllOrders,
  getTrackingInfo,
};
