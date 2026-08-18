export const welcomeTemplate = (name: string) => `
<div style="margin:0; padding:0; background:#b8ab8a; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Logo -->
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="https://bookd.vip" target="_blank">
                <img
                  src="https://bookd.vip/uploads/profile/bookd-logo-cropped.svg"
                  alt="BOOKD Logo"
                  width="120"
                  style="display:block;"
                />
              </a>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="520" style="background:#ffffff; border-radius:8px; padding:30px;">
          <tr>
            <td align="center">

              <h2 style="margin:0; color:#000;">Welcome to BOOKD 🎉</h2>

              <p style="font-size:16px; color:#333; margin-top:15px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="font-size:15px; line-height:24px; color:#444;">
                We're excited to have you join <strong>BOOKD</strong>!
                You now have access to powerful tools that help you manage bookings,
                organize services, and streamline your workflow.
              </p>

              <p style="font-size:15px; line-height:24px; color:#444;">
                If you ever need help, simply reply to this email —
                our support team is always ready to assist you.
              </p>

              <!-- CTA -->
              <div style="margin-top:25px;">
                <a href="https://bookd.vip"
                  style="background:#000; color:#fff; padding:12px 24px;
                  text-decoration:none; border-radius:6px; font-size:15px; font-weight:bold;">
                  Go to Dashboard
                </a>
              </div>

            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-top:15px; color:#222; font-size:13px;">
              © ${new Date().getFullYear()}
              <a href="https://bookd.vip" style="color:#000; text-decoration:none; font-weight:bold;">
                BOOKD
              </a>.
              All Rights Reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</div>
`;
