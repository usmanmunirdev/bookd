export const resetPasswordTemplate = (name: string) => `
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
              <h2 style="color:#2ECC71; text-align:center;">Password Changed Successfully</h2>

              <p style="font-size:16px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="font-size:16px; line-height:24px;">
                This is a confirmation that your <strong>BOOKD</strong> account password has been successfully updated.
              </p>

              <p style="font-size:16px; line-height:24px;">
                If you did not make this change, please contact our support team immediately.
              </p>

              <div style="text-align:center; margin-top:30px;">
                <a href="https://bookd.vip/login" 
                  style="background:#2ECC71; color:white; padding:12px 22px;
                         border-radius:6px; text-decoration:none; font-size:16px; display:inline-block;">
                  Log In
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
