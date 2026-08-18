const formatDate = (d: any) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(d);
  }
};

const formatDateTime = (d: any) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(d);
  }
};

const row = (label: string, value: any, highlight = false) =>
  value
    ? `<tr>
        <td style="padding:10px 12px;font-weight:600;color:#555;white-space:nowrap;font-size:14px;border-bottom:1px solid #f0ece3;vertical-align:top;width:38%;">${label}</td>
        <td style="padding:10px 12px;color:${highlight ? '#c0392b' : '#222'};font-size:14px;border-bottom:1px solid #f0ece3;vertical-align:top;">${value}</td>
      </tr>`
    : '';

const badge = (text: string, color: string) =>
  `<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:${color};color:#fff;font-size:12px;font-weight:600;">${text}</span>`;

export const hotelBookingTemplate = (name: string, hotel: any) => {
  // ── Cancellation policy summary ──────────────────────────────
  const policies: any[] = hotel.cancellationPolicies ?? [];
  const nonRefundable = hotel.nonRefundable ?? policies.some((p: any) => p.type === 'NONREFUND');

  let cancellationHtml = '';
  if (nonRefundable) {
    cancellationHtml = badge('Non-Refundable', '#c0392b');
  } else if (hotel.freeCancellationDeadline) {
    cancellationHtml = `${badge('Free Cancellation', '#27ae60')} <span style="font-size:13px;color:#555;margin-left:6px;">until ${formatDateTime(hotel.freeCancellationDeadline)}</span>`;
  } else if (policies.length) {
    const firstPolicy = policies[0];
    cancellationHtml = `<span style="font-size:13px;color:#555;">Cancellation penalty applies from ${formatDateTime(firstPolicy.from)}: ${hotel.currency} ${firstPolicy.amount}</span>`;
  } else {
    cancellationHtml = badge('Contact Hotel', '#7f8c8d');
  }

  // ── Address assembly ─────────────────────────────────────────
  const addressParts = [hotel.address, hotel.city, hotel.postalCode, hotel.countryCode].filter(Boolean);
  const fullAddress = addressParts.join(', ') || hotel.destinationName || '—';

  // ── Guest count ──────────────────────────────────────────────
  const adults = hotel.adults ?? 1;
  const children = hotel.children ?? 0;
  const guestText = `${adults} Adult${adults > 1 ? 's' : ''}${children ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;

  // ── Star rating ──────────────────────────────────────────────
  const stars = hotel.rating ? '★'.repeat(Math.min(Number(hotel.rating), 5)) : '';

  // ── Payment badge ────────────────────────────────────────────
  const paymentBadge =
    hotel.paymentType === 'AT_HOTEL'
      ? badge('Pay at Hotel', '#e67e22')
      : badge('Prepaid – Confirmed', '#27ae60');

  // ── Header image ─────────────────────────────────────────────
  const headerImage =
    Array.isArray(hotel.images) && hotel.images.length
      ? `<img src="${hotel.images[0]}" alt="${hotel.hotelName}" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#b8ab8a;font-family:'Helvetica Neue',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px;">
  <tr>
    <td align="center">

      <!-- Logo -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="https://bookd.vip" target="_blank">
              <img src="https://bookd.vip/uploads/profile/bookd-logo-cropped.svg" alt="BOOKD" width="110" style="display:block;" />
            </a>
          </td>
        </tr>
      </table>

      <!-- Card -->
      <table role="presentation" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:12px;width:100%;max-width:560px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);">
        <tr>
          <td>

            ${headerImage}

            <!-- Header banner -->
            <div style="background:linear-gradient(135deg,#1a1a1a 0%,#3d3d3d 100%);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px;color:#b8ab8a;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Booking Confirmed</p>
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">🏨 Hotel Reservation</h1>
              ${hotel.bookingReference ? `<p style="margin:10px 0 0;color:#ccc;font-size:13px;">Reference: <strong style="color:#fff;">${hotel.bookingReference}</strong></p>` : ''}
            </div>

            <!-- Body -->
            <div style="padding:32px;">

              <p style="font-size:16px;color:#333;margin:0 0 6px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                Your stay at <strong style="color:#222;">${hotel.hotelName}</strong> has been confirmed.
                Here are your booking details:
              </p>

              <!-- Hotel name + stars -->
              <div style="background:#f9f7f3;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                <h2 style="margin:0 0 4px;color:#1a1a1a;font-size:20px;">${hotel.hotelName}</h2>
                ${stars ? `<p style="margin:0 0 6px;color:#e67e22;font-size:18px;letter-spacing:2px;">${stars}</p>` : ''}
                ${hotel.categoryName ? `<p style="margin:0 0 8px;font-size:13px;color:#888;">${hotel.categoryName}</p>` : ''}
                <p style="margin:0;font-size:14px;color:#555;">📍 ${fullAddress}</p>
                ${hotel.phone ? `<p style="margin:4px 0 0;font-size:13px;color:#888;">📞 ${hotel.phone}</p>` : ''}
                ${hotel.website ? `<p style="margin:4px 0 0;font-size:13px;"><a href="${hotel.website}" style="color:#e67e22;">${hotel.website}</a></p>` : ''}
              </div>

              <!-- Stay dates -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="width:50%;padding:16px;text-align:center;background:#f0ece3;border-radius:8px 0 0 8px;border-right:2px solid #fff;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;">Check-In</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#1a1a1a;">${formatDate(hotel.checkInDate)}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#888;">From 14:00</p>
                  </td>
                  <td style="width:50%;padding:16px;text-align:center;background:#f0ece3;border-radius:0 8px 8px 0;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;">Check-Out</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#1a1a1a;">${formatDate(hotel.checkOutDate)}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#888;">Until 12:00</p>
                  </td>
                </tr>
              </table>

              <!-- Details table -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #f0ece3;border-radius:8px;overflow:hidden;">
                ${row('Duration', hotel.nights ? `${hotel.nights} Night${hotel.nights > 1 ? 's' : ''}` : null)}
                ${row('Guests', guestText)}
                ${hotel.childrenAges?.length ? row('Children Ages', hotel.childrenAges.join(', ') + ' yrs') : ''}
                ${row('Room Type', hotel.roomType)}
                ${row('Room Code', hotel.roomCode)}
                ${hotel.roomDescription ? row('Description', hotel.roomDescription) : ''}
                ${row('Board', hotel.boardName ?? hotel.boardCode)}
                ${row('Rate Type', hotel.rateType)}
                ${hotel.rateComments ? row('Rate Comments', hotel.rateComments) : ''}
                ${hotel.holderName ? row('Lead Guest', `${hotel.holderName} ${hotel.holderSurname ?? ''}`) : ''}
                ${hotel.holderEmail ? row('Guest Email', hotel.holderEmail) : ''}
                ${hotel.holderPhone ? row('Guest Phone', hotel.holderPhone) : ''}
                ${hotel.clientReference ? row('Client Ref', hotel.clientReference) : ''}
                ${hotel.chainName ? row('Hotel Chain', hotel.chainName) : ''}
              </table>

              <!-- Price breakdown -->
              <div style="background:#f9f7f3;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                <h3 style="margin:0 0 16px;font-size:15px;text-transform:uppercase;letter-spacing:1px;color:#888;">Price Breakdown</h3>
                ${hotel.sellingRate && hotel.sellingRate !== hotel.netPrice
                  ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e8e4db;">
                      <span style="color:#555;font-size:14px;">Selling Rate</span>
                      <span style="color:#555;font-size:14px;">${hotel.currency} ${Number(hotel.sellingRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>` : ''}
                ${hotel.commissionPct
                  ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e8e4db;">
                      <span style="color:#555;font-size:14px;">Commission (${hotel.commissionPct}%)</span>
                      <span style="color:#555;font-size:14px;">${hotel.currency} ${Number(hotel.commission ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>` : ''}
                <div style="display:flex;justify-content:space-between;padding:10px 0 0;">
                  <span style="font-size:17px;font-weight:700;color:#1a1a1a;">Total</span>
                  <span style="font-size:17px;font-weight:700;color:#1a1a1a;">${hotel.currency} ${Number(hotel.totalPrice ?? hotel.netPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="margin-top:12px;">${paymentBadge}</div>
              </div>

              <!-- Cancellation policy -->
              <div style="border:1px solid ${nonRefundable ? '#e74c3c' : '#d4edda'};border-radius:10px;padding:16px 20px;margin-bottom:24px;background:${nonRefundable ? '#fff5f5' : '#f4fbf6'};">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${nonRefundable ? '#c0392b' : '#27ae60'};">Cancellation Policy</p>
                <div>${cancellationHtml}</div>
                ${policies.length > 0 && !nonRefundable
                  ? `<table style="width:100%;margin-top:12px;border-collapse:collapse;font-size:13px;">
                      <tr style="background:#e8f5e9;">
                        <th style="padding:6px 10px;text-align:left;color:#27ae60;">From</th>
                        <th style="padding:6px 10px;text-align:right;color:#27ae60;">Penalty</th>
                      </tr>
                      ${policies.map((p: any) => `
                        <tr>
                          <td style="padding:5px 10px;color:#555;">${formatDateTime(p.from)}</td>
                          <td style="padding:5px 10px;text-align:right;color:#c0392b;font-weight:600;">${hotel.currency} ${Number(p.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>`).join('')}
                    </table>`
                  : ''}
              </div>

              <!-- Important notice -->
              <div style="background:#fff8e1;border-left:4px solid #f39c12;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#7d5a00;line-height:1.6;">
                  <strong>Important:</strong> Please carry a valid photo ID and this confirmation at check-in.
                  Early check-in / late check-out are subject to hotel availability.
                  Contact the hotel directly for special requests.
                </p>
              </div>

              <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                Thank you for booking with <strong>BOOKD</strong>! We hope you enjoy your stay.
                Need help? Reply to this email or visit <a href="https://bookd.vip" style="color:#e67e22;">bookd.vip</a>.
              </p>

            </div>

            <!-- Footer social -->
            <div style="background:#1a1a1a; padding:24px; text-align:center;">
  <p style="margin:0; color:#888; font-size:12px;">
    © ${new Date().getFullYear()} 
    <a href="https://bookd.vip" style="color:#b8ab8a; text-decoration:none; font-weight:700;">BOOKD</a>. All Rights Reserved.
  </p>
</div>

          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
};