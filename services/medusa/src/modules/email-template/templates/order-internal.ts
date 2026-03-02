export const orderInternalTemplate = {
  subject: "New order received - {{total}}",
  text: [
    "A new order has been placed.",
    "",
    "Order ID: {{order_id}}",
    "Placed at: {{placed_at}}",
    "Customer email: {{customer_email}}",
    "",
    "Items:",
    "{{items_text}}",
    "",
    "Subtotal: {{subtotal}}",
    "Shipping: {{shipping_total}} ({{shipping_method}})",
    "Tax: {{tax_total}}",
    "Total: {{total}}",
    "",
    "Shipping address: {{shipping_address}}",
    "{{order_admin_url_line}}",
  ].join("\n"),
  html: `
    <div style="margin:0;padding:24px;background:#090704;font-family:Georgia,'Times New Roman',serif;">
      <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">{{preheader}}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;border-collapse:collapse;border:1px solid #3c311f;background:#12100b;border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:26px 30px;background:linear-gradient(135deg,#151109 0%,#1d1509 55%,#2a1d0d 100%);border-bottom:1px solid #4b3a20;">
                  <p style="margin:0 0 8px;color:#d4b06e;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2.2px;text-transform:uppercase;">New Order Alert</p>
                  <h1 style="margin:0;color:#f4e8d0;font-weight:500;font-size:34px;line-height:1.2;">New order received</h1>
                  <p style="margin:12px 0 0;color:#d9c39a;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">A new paid order entered your pipeline and is ready for processing.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 30px;background:#12100b;color:#f3e7ce;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
                    <tr>
                      <td style="padding:14px 18px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Order Snapshot</td>
                    </tr>
                    <tr>
                      <td style="padding:0 18px 16px;">
                        <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Order ID:</strong> {{order_id}}</p>
                        <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Placed at:</strong> {{placed_at}}</p>
                        <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Customer:</strong> {{customer_email}}</p>
                        <p style="margin:0;color:#f2dfb6;"><strong>Total:</strong> {{total}}</p>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 10px;color:#e7d0a2;font-size:15px;font-weight:700;">Items</p>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                          <tr>
                            <th align="left" style="padding:0 10px 8px 0;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Product</th>
                            <th align="center" style="padding:0 10px 8px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Qty</th>
                            <th align="right" style="padding:0 10px 8px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Unit</th>
                            <th align="right" style="padding:0 0 8px 10px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Line Total</th>
                          </tr>
                          {{items_rows_html}}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
                    <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Delivery and totals</td></tr>
                    <tr><td style="padding:0 18px 16px;">
                      <p style="margin:0 0 6px;color:#d9c39a;"><strong>Shipping method:</strong> {{shipping_method}}</p>
                      <p style="margin:0 0 10px;color:#d9c39a;"><strong>Shipping address:</strong> {{shipping_address}}</p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                        <tr><td style="padding:4px 0;color:#cdb894;">Subtotal</td><td style="padding:4px 0;color:#f3e7ce;text-align:right;">{{subtotal}}</td></tr>
                        <tr><td style="padding:4px 0;color:#cdb894;">Shipping</td><td style="padding:4px 0;color:#f3e7ce;text-align:right;">{{shipping_total}}</td></tr>
                        <tr><td style="padding:4px 0;color:#cdb894;">Tax</td><td style="padding:4px 0;color:#f3e7ce;text-align:right;">{{tax_total}}</td></tr>
                        <tr><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;font-weight:700;">Total</td><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;text-align:right;font-weight:700;">{{total}}</td></tr>
                      </table>
                    </td></tr>
                  </table>

                  {{order_admin_button}}
                </td>
              </tr>
              <tr>
                <td style="padding:16px 30px 22px;border-top:1px solid #3f321f;background:#0e0c08;color:#bca478;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
                  Internal notification from Natural Mystic Aroma order system.<br />
                  <span style="color:#8d7a55;">Natural Mystic Aroma</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `.trim(),
};
