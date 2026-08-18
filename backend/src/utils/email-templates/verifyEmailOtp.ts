export const verifyEmailOtpTemplate = (name: string, otp: string) => `
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

        <!-- Email Content -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:8px; width:100%; max-width:500px; padding:30px;">
          <tr>
            <td>
              <h2 style="color:#E67E22; text-align:center;">Verify Your Email Address</h2>

              <p style="font-size:16px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="font-size:16px; line-height:24px;">
                Thank you for signing up for <strong>BOOKD</strong>!  
                To complete your registration, please use the 6-digit code below to verify your email address:
              </p>

              <div style="text-align:center; margin:30px 0;">
                <span style="font-size:28px; letter-spacing:8px; font-weight:bold; background:#F8F6F2; padding:12px 20px; border-radius:8px; display:inline-block;">
                  ${otp}
                </span>
              </div>

              <p style="font-size:16px; line-height:24px;">
                This code is valid for the next 5 minutes. If you did not request this, please ignore this email.
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
