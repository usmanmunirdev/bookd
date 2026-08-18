export const contactReplyTemplate = (userName: string, replySubject: string, replyMessage: string) => `
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
              <h2 style="color:#4A90E2; text-align:center;">Response to Your Inquiry</h2>

              <p style="font-size:16px;">
                Hi <strong>${userName}</strong>,
              </p>

              <p style="font-size:16px; line-height:24px;">
                Thank you for reaching out to us. Here is the response from our support team regarding your query:
              </p>

              <div style="margin:20px 0; padding:15px; border-left:4px solid #4A90E2; background:#f9f9f9;">
                <h3 style="font-size:16px; margin-bottom:8px; color:#333;">${replySubject}</h3>
                <p style="font-size:15px; line-height:22px; color:#555;">${replyMessage}</p>
              </div>

              <p style="font-size:16px; line-height:24px;">
                If you have any further questions or need assistance, feel free to reply to this email. We’re happy to help!
              </p>

              <div style="text-align:center; margin-top:30px;">
                <a href="https://bookd.vip" 
                  style="background:#4A90E2; color:white; padding:12px 22px;
                         border-radius:6px; text-decoration:none; font-size:16px; display:inline-block;">
                  Visit Dashboard
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
