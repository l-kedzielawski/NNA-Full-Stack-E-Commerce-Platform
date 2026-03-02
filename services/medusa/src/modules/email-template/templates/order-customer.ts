export const orderCustomerTemplate = {
  subject: "Order confirmation - The Mystic Aroma",
  text: [
    "Thank you for your order with The Mystic Aroma.",
    "",
    "Placed at: {{placed_at}}",
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
    "",
    "If anything needs to be updated, reply to this email and our team will help right away.",
    "",
    "The Mystic Aroma",
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
                  <p style="margin:0 0 8px;color:#d4b06e;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2.2px;text-transform:uppercase;">Order Confirmed</p>
                  <h1 style="margin:0;color:#f4e8d0;font-weight:500;font-size:34px;line-height:1.2;">Thank you for your order</h1>
                  <p style="margin:12px 0 0;color:#d9c39a;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">Your items are now reserved and our logistics team is preparing dispatch from our Poznan warehouse.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 30px;background:#12100b;color:#f3e7ce;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 6px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Order confirmed</p>
                        <p style="margin:0;color:#f4e8d0;font-size:16px;font-weight:600;">Placed on {{placed_at}}</p>
                      </td>
                      <td style="padding:16px 18px;border-left:1px solid #3f321f;min-width:160px;text-align:right;">
                        <p style="margin:0 0 6px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Order Total</p>
                        <p style="margin:0;color:#f2dfb6;font-size:24px;font-weight:700;">{{total}}</p>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 10px;color:#e7d0a2;font-size:15px;font-weight:700;letter-spacing:0.2px;">Items in this order</p>
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
                    <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Payment summary</td></tr>
                    <tr><td style="padding:0 18px 14px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#cdb894;">Subtotal</td><td style="padding:6px 0;color:#f3e7ce;text-align:right;">{{subtotal}}</td></tr>
                        <tr><td style="padding:6px 0;color:#cdb894;">Shipping ({{shipping_method}})</td><td style="padding:6px 0;color:#f3e7ce;text-align:right;">{{shipping_total}}</td></tr>
                        <tr><td style="padding:6px 0;color:#cdb894;">Tax</td><td style="padding:6px 0;color:#f3e7ce;text-align:right;">{{tax_total}}</td></tr>
                        <tr><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;font-weight:700;">Total</td><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;text-align:right;font-weight:700;">{{total}}</td></tr>
                      </table>
                    </td></tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
                    <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Shipping destination</td></tr>
                    <tr><td style="padding:0 18px 16px;color:#d9c39a;">{{shipping_address}}</td></tr>
                  </table>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 4px;">
                    <tr>
                      <td style="border-radius:999px;background:#d1ae72;">
                        <a href="{{site_url}}" style="display:inline-block;padding:11px 18px;color:#161109;font-size:13px;font-weight:700;letter-spacing:0.3px;text-decoration:none;">Visit The Mystic Aroma</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0;color:#bda57a;font-size:12px;">Need any changes? Reply directly to this email and our team will help right away.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 30px 22px;border-top:1px solid #3f321f;background:#0e0c08;color:#bca478;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
                  You are receiving this message because an order was placed with your email address.<br />
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
