export const forgotPasswordTemplate = (name: string, resetLink: string) => `
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
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background:#ffffff; border-radius:18px; text-align:center;"
        >
          <tr>
            <td style="padding:40px 30px;">

              <h1 style="margin:0; font-size:28px; color:#111;">
                Forgot Your Password?
              </h1>

              <p style="padding-top:20px; color:#555; font-size:16px; line-height:26px;">
                Hi <strong>${name}</strong>,<br/><br/>
                We received a request to reset your password for
                <a href="https://bookd.vip" target="_blank"
                   style="color:#000; text-decoration:none; font-weight:bold;">
                  BOOKD
                </a>.
                <br/><br/>
                Click the button below to set a new password.
              </p>

              <!-- Button -->
              <div style="padding:30px 0;">
                <a href="${resetLink}" target="_blank"
                  style="
                    background:#2a0018;
                    color:#ffffff;
                    padding:14px 28px;
                    border-radius:6px;
                    text-decoration:none;
                    font-size:16px;
                    font-weight:bold;
                    display:inline-block;">
                  Reset Password
                </a>
              </div>

              <p style="color:#666; font-size:14px; line-height:22px;">
                If you didn’t request a password reset, you can safely ignore this email.
              </p>

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
