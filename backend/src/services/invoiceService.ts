import PDFDocument from "pdfkit";
import { Response } from "express";

export function generateInvoicePdf(res: Response, orderData: any, userName: string, userEmail: string): void {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${orderData.order_id}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("DAVINA SKINCARE", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica").text("Invoice", { align: "center" });
  doc.moveDown(1);

  // Order Info
  doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details");
  doc.font("Helvetica");
  doc.text(`Order #: ${orderData.order_id}`);
  doc.text(`Date: ${new Date(orderData.createdAt).toLocaleDateString("en-US")}`);
  doc.text(`Customer: ${userName}`);
  doc.text(`Email: ${userEmail}`);
  doc.moveDown(1);

  // Shipping
  if (orderData.shipping_method) {
    doc.font("Helvetica-Bold").text("Shipping");
    doc.font("Helvetica");
    doc.text(`Method: ${orderData.shipping_method}`);
    if (orderData.tracking_number) {
      doc.text(`Tracking: ${orderData.tracking_number}`);
    }
    doc.moveDown(1);
  }

  // Items Table Header
  const tableTop = doc.y;
  doc.font("Helvetica-Bold");
  doc.text("Product", 50, tableTop, { width: 250 });
  doc.text("Qty", 300, tableTop, { width: 60, align: "center" });
  doc.text("Price", 360, tableTop, { width: 80, align: "right" });
  doc.text("Total", 440, tableTop, { width: 80, align: "right" });

  doc.moveTo(50, doc.y + 5).lineTo(520, doc.y + 5).stroke();
  doc.moveDown(0.5);

  // Items
  doc.font("Helvetica");
  const items = Array.isArray(orderData.ordered_items) ? orderData.ordered_items : [];
  for (const item of items) {
    const y = doc.y;
    doc.text(item.name || "Product", 50, y, { width: 250 });
    doc.text(String(item.quantity || 1), 300, y, { width: 60, align: "center" });
    doc.text(`€${(item.price || 0).toFixed(2)}`, 360, y, { width: 80, align: "right" });
    doc.text(`€${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`, 440, y, { width: 80, align: "right" });
    doc.moveDown(0.5);
  }

  doc.moveTo(50, doc.y + 5).lineTo(520, doc.y + 5).stroke();
  doc.moveDown(1);

  // Totals
  doc.font("Helvetica");
  const subtotal = items.reduce((sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1), 0);
  doc.text(`Subtotal: €${subtotal.toFixed(2)}`, { align: "right" });

  if (orderData.discount_amount > 0) {
    doc.text(`Discount: -€${parseFloat(orderData.discount_amount).toFixed(2)}`, { align: "right" });
  }

  if (orderData.shipping_cost) {
    doc.text(`Shipping: €${parseFloat(orderData.shipping_cost).toFixed(2)}`, { align: "right" });
  }

  if (orderData.tax_amount) {
    doc.text(`Tax (19% VAT): €${parseFloat(orderData.tax_amount).toFixed(2)}`, { align: "right" });
  }

  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(14);
  doc.text(`Total: €${parseFloat(orderData.total_price).toFixed(2)}`, { align: "right" });

  // Footer
  doc.moveDown(2);
  doc.fontSize(9).font("Helvetica").fillColor("#666666");
  doc.text("Thank you for shopping with Davina Skincare!", { align: "center" });
  doc.text("Contact: support@davina-skincare.com", { align: "center" });

  doc.end();
}
