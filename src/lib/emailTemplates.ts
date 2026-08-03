// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOrderCreatedEmailTemplate = (sale: any) => {
  const customerName = sale.customer?.name || "Valued Customer";

  let itemsHtml = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sale.items?.forEach((item: any) => {
    const productName = item.product?.name || "Product";
    itemsHtml += `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${productName}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px; text-align: right;">৳ ${item.total?.toLocaleString() || 0}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div style="background-color: #00B4D8; padding: 30px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Order Confirmation</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Hello ${customerName},</h2>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px; font-size: 15px;">
            Thank you for your order! We have received your order <strong style="color: #00B4D8;">#${sale.saleNo}</strong> and are currently processing it.
          </p>
          
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase;">Product</th>
                <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase;">Qty</th>
                <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 0; text-align: right; color: #6b7280; font-size: 14px;">Subtotal:</td>
                <td style="padding: 12px 0; text-align: right; color: #374151; font-size: 14px;">৳ ${sale.subTotal?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right; color: #6b7280; font-size: 14px;">Shipping Charge:</td>
                <td style="padding: 8px 0; text-align: right; color: #374151; font-size: 14px;">৳ ${sale.shippingCharge?.toLocaleString() || 0}</td>
              </tr>
              ${sale.discount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right; color: #10b981; font-size: 14px;">Discount:</td>
                <td style="padding: 8px 0; text-align: right; color: #10b981; font-size: 14px;">- ৳ ${sale.discount?.toLocaleString() || 0}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 16px 0; text-align: right; font-weight: 600; color: #111827; font-size: 16px; border-top: 2px solid #e5e7eb;">Total Amount:</td>
                <td style="padding: 16px 0; text-align: right; font-weight: 700; color: #00B4D8; font-size: 18px; border-top: 2px solid #e5e7eb;">৳ ${sale.totalAmount?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right; color: #6b7280; font-size: 14px;">Paid Amount:</td>
                <td style="padding: 8px 0; text-align: right; color: #374151; font-size: 14px;">৳ ${sale.paidAmount?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600;">Due Amount:</td>
                <td style="padding: 8px 0; text-align: right; color: ${sale.dueAmount > 0 ? '#ef4444' : '#10b981'}; font-size: 14px; font-weight: 600;">৳ ${sale.dueAmount?.toLocaleString() || 0}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; border-radius: 4px 8px 8px 4px; font-size: 14px; color: #0f766e;">
            <strong>Shipping Details:</strong><br>
            ${sale.customer?.address || 'Will be contacted for shipping details.'}
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; line-height: 1.5;">
            We will notify you once your order has been shipped. If you have any questions, feel free to contact our support team.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 13px;">This is an automated notification from Raantech. Please do not reply to this email.</p>
          <p style="margin: 0; margin-top: 10px; color: #94a3b8; font-size: 13px;">&copy; ${new Date().getFullYear()} Raantech. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOrderStatusEmailTemplate = (sale: any, status: string) => {
  const customerName = sale.customer?.name || "Valued Customer";
  
  let statusMessage = "";
  let statusColor = "#00B4D8";
  let title = "Order Update";

  if (status === "SHIPPED") {
    title = "Order Shipped";
    statusColor = "#3b82f6";
    statusMessage = `Great news! Your order <strong style="color: ${statusColor};">#${sale.saleNo}</strong> has been shipped and is on its way to you.`;
  } else if (status === "COMPLETED" || status === "DELIVERED") {
    title = "Order Delivered";
    statusColor = "#10b981";
    statusMessage = `Your order <strong style="color: ${statusColor};">#${sale.saleNo}</strong> has been successfully delivered. We hope you love your products!`;
  } else if (status === "CANCELLED") {
    title = "Order Cancelled";
    statusColor = "#ef4444";
    statusMessage = `We regret to inform you that your order <strong style="color: ${statusColor};">#${sale.saleNo}</strong> has been cancelled.`;
  } else {
    statusMessage = `There is an update regarding your order <strong style="color: ${statusColor};">#${sale.saleNo}</strong>.`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div style="background-color: ${statusColor}; padding: 30px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">${title}</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Hello ${customerName},</h2>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px; font-size: 15px;">
            ${statusMessage}
          </p>
          
          ${sale.courierDetails ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; font-size: 14px; color: #334155; margin-bottom: 24px;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Courier & Tracking Info:</strong>
            ${sale.courierDetails}
          </div>
          ` : ''}

          <div style="background-color: #f9fafb; border-left: 4px solid ${statusColor}; padding: 15px; border-radius: 4px 8px 8px 4px; margin-bottom: 20px; font-size: 14px; color: #374151;">
            <strong>Order Status:</strong> <span style="font-weight: 600; color: ${statusColor};">${status}</span><br>
            <strong>Total Amount:</strong> ৳ ${sale.totalAmount?.toLocaleString() || 0}<br>
            <strong>Due Amount:</strong> ৳ ${sale.dueAmount?.toLocaleString() || 0}
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; line-height: 1.5;">
            Thank you for shopping with us! If you need any assistance, please reply to this email or contact our support.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 13px;">This is an automated notification from Raantech. Please do not reply to this email.</p>
          <p style="margin: 0; margin-top: 10px; color: #94a3b8; font-size: 13px;">&copy; ${new Date().getFullYear()} Raantech. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
