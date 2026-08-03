function getOrderEmailTemplate(
  buyerName,
  paymentMethod,
  items,
  shippingAddress,
  totalAmount
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 30px; }
        .email-wrapper { max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { background-color: #111827; color: #ffffff; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
        .header p { margin: 5px 0 0 0; font-size: 13px; color: #9ca3af; }
        .content { padding: 30px; color: #374151; font-size: 14px; line-height: 1.6; }
        .greeting { margin-top: 0; font-size: 16px; color: #111827; }
        .box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0; }
        .box-title { margin: 0 0 15px 0; font-size: 15px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .table th { color: #6b7280; text-align: left; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .table td { padding: 12px 0; color: #111827; border-bottom: 1px solid #f3f4f6; }
        .table td.qty { text-align: center; color: #4b5563; }
        .table td.price { text-align: right; font-weight: 600; }
        .total-section { border-top: 1px solid #e5e7eb; margin-top: 15px; padding-top: 15px; }
        .total-label { font-size: 15px; font-weight: 600; color: #111827; }
        .total-value { font-size: 16px; font-weight: 700; color: #059669; float: right; }
        .clearfix { clear: both; }
        .address-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px 20px; margin-bottom: 25px; }
        .address-title { margin: 0 0 8px 0; font-size: 14px; color: #111827; }
        .address-text { margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5; }
        .footer { background-color: #f3f4f6; color: #6b7280; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>Kotla Marketplace</h1>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <p class="greeting">Hello <strong>${
            buyerName || "Customer"
          }</strong>,</p>
          <p>Thank you for shopping with us! Your order has been successfully placed via <strong>${
            paymentMethod || "COD"
          }</strong>.</p>
          
          <div class="box">
            <h3 class="box-title">Order Summary</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="qty">${item.quantity}</td>
                    <td class="price">₨ ${item.price}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="total-section">
              <span class="total-label">Total Amount:</span>
              <span class="total-value">₨ ${totalAmount}</span>
              <div class="clearfix"></div>
            </div>
          </div>

          <div class="address-box">
            <h4 class="address-title">Shipping Address</h4>
            <p class="address-text">${shippingAddress}</p>
          </div>

          <p style="margin-bottom: 0;">We will notify you once your order is shipped.</p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 5px 0;">Kotla Marketplace - Happy Shopping!</p>
          <p style="margin: 0;">&copy; 2026 Kotla Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { getOrderEmailTemplate };
