import { Request, Response } from "express";
import Order from "../models/order";
import Payment from "../models/payment";
import User from "../models/user";
import ProductItem from "../models/productItems";
import { Op } from "sequelize";
import sequelize from "../config/db";

async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const [totalOrders, totalUsers, totalProducts, revenueResult] = await Promise.all([
      Order.count(),
      User.count(),
      ProductItem.countDocuments(),
      Payment.findAll({
        where: { status: "paid" },
        attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total_revenue"]],
        raw: true,
      }),
    ]);

    const totalRevenue = (revenueResult[0] as any)?.total_revenue || 0;

    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrdersCount = await Order.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
    });

    // Orders by status
    const ordersByStatus = await Order.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("order_id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // Revenue by month (last 12 months)
    const revenueByMonth = await Payment.findAll({
      where: {
        status: "paid",
        createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) },
      },
      attributes: [
        [sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")), "month"],
        [sequelize.fn("SUM", sequelize.col("amount")), "revenue"],
      ],
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at"))],
      order: [[sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    // Top selling products
    const allOrders = await Order.findAll({ attributes: ["ordered_items"], raw: true });
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const order of allOrders) {
      const items = Array.isArray(order.ordered_items) ? order.ordered_items : [];
      for (const item of items) {
        const id = item.product_id || item.name;
        if (!productSales[id]) {
          productSales[id] = { name: item.name || id, quantity: 0, revenue: 0 };
        }
        productSales[id].quantity += item.quantity || 1;
        productSales[id].revenue += (item.price || 0) * (item.quantity || 1);
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Low stock products
    const lowStockProducts = await ProductItem.find({ stock: { $lte: 5 } })
      .select("p_name stock price")
      .sort({ stock: 1 })
      .limit(20);

    // Payment methods distribution
    const paymentMethods = await Payment.findAll({
      attributes: ["payment_method", [sequelize.fn("COUNT", sequelize.col("payment_id")), "count"]],
      group: ["payment_method"],
      raw: true,
    });

    res.status(200).json({
      data: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue: parseFloat(totalRevenue),
        recentOrdersCount,
        ordersByStatus,
        revenueByMonth,
        topProducts,
        lowStockProducts,
        paymentMethods,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch dashboard statistics." });
  }
}

async function exportOrdersCsv(_req: Request, res: Response): Promise<void> {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const headers = "Order ID,User ID,Total Price,Status,Shipping Method,Tracking Number,Created At\n";
    const rows = orders
      .map((o: any) =>
        `${o.order_id},${o.user_id},${o.total_price},${o.status},${o.shipping_method || ""},${o.tracking_number || ""},${o.createdAt}`
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.send(headers + rows);
  } catch (error) {
    console.error("Error exporting orders:", (error as Error).message);
    res.status(500).json({ error: "Failed to export orders." });
  }
}

async function exportProductsCsv(_req: Request, res: Response): Promise<void> {
  try {
    const products = await ProductItem.find().lean();

    const headers = "ID,Name,Price,Stock,Category,Skin Type,Effect,Average Rating,Review Count\n";
    const rows = products
      .map((p: any) =>
        `${p._id},"${(p.p_name || "").replace(/"/g, '""')}",${p.price},${p.stock},${p.category || ""},${p.skin_typ_target},${p.effect},${p.average_rating || 0},${p.review_count || 0}`
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.send(headers + rows);
  } catch (error) {
    console.error("Error exporting products:", (error as Error).message);
    res.status(500).json({ error: "Failed to export products." });
  }
}

async function bulkImportProducts(req: Request, res: Response): Promise<void> {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ message: "products array is required." });
      return;
    }

    const created = await ProductItem.insertMany(products, { ordered: false });
    res.status(201).json({ message: `${created.length} products imported.`, data: created });
  } catch (error) {
    console.error("Error bulk importing products:", (error as Error).message);
    res.status(500).json({ error: "Failed to import products." });
  }
}

export { getDashboardStats, exportOrdersCsv, exportProductsCsv, bulkImportProducts };
