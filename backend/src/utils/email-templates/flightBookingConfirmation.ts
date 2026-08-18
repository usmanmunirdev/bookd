const formatDate = (d: any) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return String(d); }
};

const formatDateTime = (d: any) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return String(d); }
};

const formatDuration = (iso: string) => {
  if (!iso) return '—';
  return iso.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
};

const badge = (text: string, color: string) =>
  `<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:${color};color:#fff;font-size:12px;font-weight:600;">${text}</span>`;

const row = (label: string, value: any) =>
  value
    ? `<tr>
        <td style="padding:9px 12px;font-weight:600;color:#555;white-space:nowrap;font-size:13px;border-bottom:1px solid #f0ece3;vertical-align:top;width:38%;">${label}</td>
        <td style="padding:9px 12px;color:#222;font-size:13px;border-bottom:1px solid #f0ece3;vertical-align:top;">${value}</td>
      </tr>`
    : '';

export const flightBookingTemplate = (name: string, flight: any) => {
  const segments: any[] = flight.segments ?? [];
  const travelers: any[] = flight.travelers ?? [];
  const seatAssignments: any[] = flight.seatAssignments ?? [];

  const adults   = flight.adults   ?? travelers.filter((t: any) => t.type === 'ADULT').length;
  const children = flight.children ?? travelers.filter((t: any) => t.type === 'CHILD').length;
  const infants  = flight.infants  ?? travelers.filter((t: any) => t.type === 'INFANT').length;

  const guestText = [
    adults   ? `${adults} Adult${adults > 1 ? 's' : ''}`     : '',
    children ? `${children} Child${children > 1 ? 'ren' : ''}` : '',
    infants  ? `${infants} Infant${infants > 1 ? 's' : ''}`   : '',
  ].filter(Boolean).join(', ');

  // ── Segment rows ─────────────────────────────────────────────
  const segmentHtml = segments.length
    ? segments.map((seg: any, i: number) => `
      <tr style="background:${i % 2 === 0 ? '#f9f7f3' : '#f0ece3'};">
        <td style="padding:12px 14px;font-size:13px;color:#222;font-weight:600;border-bottom:1px solid #e8e4db;">
          ${seg.carrierCode ?? ''}${seg.number ?? ''}<br>
          <span style="font-weight:400;color:#888;font-size:12px;">${seg.aircraft?.code ?? ''}</span>
        </td>
        <td style="padding:12px 14px;font-size:13px;border-bottom:1px solid #e8e4db;">
          <strong>${seg.departure?.iataCode ?? ''}</strong>
          ${seg.departure?.terminal ? `<span style="font-size:11px;color:#888;"> T${seg.departure.terminal}</span>` : ''}<br>
          <span style="color:#555;">${formatDateTime(seg.departure?.at)}</span>
        </td>
        <td style="padding:12px 14px;font-size:12px;color:#888;text-align:center;border-bottom:1px solid #e8e4db;">
          ✈️<br>${formatDuration(seg.duration ?? '')}
        </td>
        <td style="padding:12px 14px;font-size:13px;border-bottom:1px solid #e8e4db;">
          <strong>${seg.arrival?.iataCode ?? ''}</strong>
          ${seg.arrival?.terminal ? `<span style="font-size:11px;color:#888;"> T${seg.arrival.terminal}</span>` : ''}<br>
          <span style="color:#555;">${formatDateTime(seg.arrival?.at)}</span>
        </td>
      </tr>`)
    .join('')
    : `<tr><td colspan="4" style="padding:16px;text-align:center;color:#888;">Segment details not available</td></tr>`;

  // ── Traveler rows ─────────────────────────────────────────────
  const travelerHtml = travelers.length
    ? travelers.map((t: any, i: number) => {
        const seat = seatAssignments.find((s: any) => s.travelerId === String(t.id ?? i + 1));
        return `<tr style="background:${i % 2 === 0 ? '#f9f7f3' : '#fff'};">
          <td style="padding:9px 12px;font-size:13px;border-bottom:1px solid #f0ece3;">${t.firstName ?? ''} ${t.lastName ?? ''}</td>
          <td style="padding:9px 12px;font-size:12px;color:#888;border-bottom:1px solid #f0ece3;">${t.type ?? 'ADULT'}</td>
          <td style="padding:9px 12px;font-size:13px;border-bottom:1px solid #f0ece3;">${t.nationality ?? '—'}</td>
          <td style="padding:9px 12px;font-size:13px;border-bottom:1px solid #f0ece3;">${seat ? seat.seatType.replace('_', ' ') : '—'}</td>
        </tr>`;
      }).join('')
    : '';

  // ── Baggage ───────────────────────────────────────────────────
  const baggage = flight.includedBaggage;
  const baggageText = baggage
    ? `${baggage.quantity ?? ''} × ${baggage.weight ?? '?'}${baggage.weightUnit ?? 'kg'} checked bag${(baggage.quantity ?? 1) > 1 ? 's' : ''}`
    : 'Check with airline';

  // ── Price breakdown ───────────────────────────────────────────
  const grandTotal = Number(flight.ticketPrice ?? 0);
  const baseFare   = Number(flight.baseFare ?? 0);
  const taxes      = Number(flight.taxes ?? 0);
  const fees       = Number(flight.fees ?? 0);

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
        style="background:#fff;border-radius:12px;width:100%;max-width:600px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);">
        <tr>
          <td>

            <!-- Header banner -->
            <div style="background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px;color:#b8ab8a;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Booking Confirmed</p>
              <h1 style="margin:0 0 16px;color:#fff;font-size:26px;font-weight:700;">✈️ Flight Confirmation</h1>

              <!-- Route display -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="text-align:center;padding:0 20px;">
                    <p style="margin:0;font-size:36px;font-weight:900;color:#fff;">${flight.departureAirport ?? '—'}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#aaa;">${flight.departureCity ?? ''}</p>
                  </td>
                  <td style="padding:0 16px;color:#b8ab8a;font-size:24px;">→</td>
                  <td style="text-align:center;padding:0 20px;">
                    <p style="margin:0;font-size:36px;font-weight:900;color:#fff;">${flight.arrivalAirport ?? '—'}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#aaa;">${flight.arrivalCity ?? ''}</p>
                  </td>
                </tr>
              </table>

              ${flight.pnr ? `<p style="margin:16px 0 0;background:rgba(255,255,255,.1);display:inline-block;padding:6px 18px;border-radius:20px;color:#fff;font-size:14px;letter-spacing:2px;font-weight:700;">PNR: ${flight.pnr}</p>` : ''}
            </div>

            <!-- Body -->
            <div style="padding:32px;">

              <p style="font-size:16px;color:#333;margin:0 0 6px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size:15px;color:#555;margin:0 0 28px;line-height:1.6;">
                Your flight <strong>${flight.flightNumber}</strong> has been confirmed.
                ${flight.amadeusOrderId ? `<br><span style="font-size:13px;color:#888;">Order ID: ${flight.amadeusOrderId}</span>` : ''}
              </p>

              <!-- Key info pills -->
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;">
                ${badge(flight.travelClass ?? 'ECONOMY', '#2c3e50')}
                ${badge(flight.isDirectFlight ? 'Direct Flight' : `${flight.numberOfStops} Stop${flight.numberOfStops > 1 ? 's' : ''}`, flight.isDirectFlight ? '#27ae60' : '#e67e22')}
                ${badge(`${formatDuration(flight.duration ?? '')}`, '#7f8c8d')}
              </div>

              <!-- Flight route overview -->
              <div style="background:#f0f4f8;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="text-align:left;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;">Departure</p>
                      <p style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;">${flight.departureAirport}</p>
                      ${flight.departureTerminal ? `<p style="margin:2px 0 0;font-size:12px;color:#888;">Terminal ${flight.departureTerminal}</p>` : ''}
                      <p style="margin:6px 0 0;font-size:14px;color:#444;font-weight:600;">${formatDateTime(flight.departureTime)}</p>
                    </td>
                    <td style="text-align:center;color:#b8ab8a;font-size:28px;padding:0 12px;">✈</td>
                    <td style="text-align:right;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;">Arrival</p>
                      <p style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;">${flight.arrivalAirport}</p>
                      ${flight.arrivalTerminal ? `<p style="margin:2px 0 0;font-size:12px;color:#888;">Terminal ${flight.arrivalTerminal}</p>` : ''}
                      <p style="margin:6px 0 0;font-size:14px;color:#444;font-weight:600;">${formatDateTime(flight.arrivalTime)}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Segment details -->
              ${segments.length ? `
              <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#888;">Flight Segments</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:28px;border:1px solid #e8e4db;border-radius:8px;overflow:hidden;">
                <tr style="background:#2c3e50;">
                  <th style="padding:10px 14px;text-align:left;color:#b8ab8a;font-size:12px;font-weight:600;">Flight</th>
                  <th style="padding:10px 14px;text-align:left;color:#b8ab8a;font-size:12px;font-weight:600;">Departure</th>
                  <th style="padding:10px 14px;text-align:center;color:#b8ab8a;font-size:12px;font-weight:600;">Duration</th>
                  <th style="padding:10px 14px;text-align:left;color:#b8ab8a;font-size:12px;font-weight:600;">Arrival</th>
                </tr>
                ${segmentHtml}
              </table>` : ''}

              <!-- Booking details table -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:28px;border:1px solid #f0ece3;border-radius:8px;overflow:hidden;">
                ${row('Airline', `${flight.airlineName ?? flight.airlineCode}${flight.validatingAirlineCode ? ` (Operated by ${flight.validatingAirlineCode})` : ''}`)}
                ${row('Flight Number', flight.flightNumber)}
                ${row('Class', flight.travelClass)}
                ${row('Passengers', guestText)}
                ${row('Baggage', baggageText)}
                ${flight.contactName ? row('Contact Name', flight.contactName) : ''}
                ${flight.contactEmail ? row('Contact Email', flight.contactEmail) : ''}
                ${flight.contactPhone ? row('Contact Phone', flight.contactPhone) : ''}
                ${flight.specialRequests ? row('Special Requests', flight.specialRequests) : ''}
                ${flight.clientReference ? row('Client Ref', flight.clientReference) : ''}
                ${flight.ticketingDeadline ? row('Ticketing Deadline', formatDateTime(flight.ticketingDeadline)) : ''}
              </table>

              <!-- Travelers -->
              ${travelerHtml ? `
              <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#888;">Passengers</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:28px;border:1px solid #f0ece3;border-radius:8px;overflow:hidden;">
                <tr style="background:#f0ece3;">
                  <th style="padding:9px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;">Name</th>
                  <th style="padding:9px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;">Type</th>
                  <th style="padding:9px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;">Nationality</th>
                  <th style="padding:9px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;">Seat Pref.</th>
                </tr>
                ${travelerHtml}
              </table>` : ''}

              <!-- Price breakdown -->
              <div style="background:#f9f7f3;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
                <h3 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#888;">Price Breakdown</h3>
                ${baseFare ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e8e4db;">
                  <span style="color:#555;font-size:14px;">Base Fare</span>
                  <span style="color:#555;font-size:14px;">${flight.currency} ${baseFare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                ${taxes ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e8e4db;">
                  <span style="color:#555;font-size:14px;">Taxes & Surcharges</span>
                  <span style="color:#555;font-size:14px;">${flight.currency} ${taxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                ${fees ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e8e4db;">
                  <span style="color:#555;font-size:14px;">Service Fees</span>
                  <span style="color:#555;font-size:14px;">${flight.currency} ${fees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                <div style="display:flex;justify-content:space-between;padding:12px 0 0;">
                  <span style="font-size:17px;font-weight:700;color:#1a1a1a;">Total Charged</span>
                  <span style="font-size:17px;font-weight:700;color:#1a1a1a;">${flight.currency} ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="margin-top:12px;">${badge('Paid', '#27ae60')}</div>
              </div>

              <!-- Important notice -->
              <div style="background:#fff8e1;border-left:4px solid #f39c12;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#7d5a00;line-height:1.7;">
                  <strong>Important:</strong> Arrive at the airport at least 2–3 hours before departure.
                  Carry a valid passport and this confirmation. Seat assignments are subject to airline availability at check-in.
                  ${flight.ticketingDeadline ? `<br><strong>Ticket must be issued by: ${formatDateTime(flight.ticketingDeadline)}</strong>` : ''}
                </p>
              </div>

              <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                Thank you for booking with <strong>BOOKD</strong>! Wishing you a safe and pleasant journey.
                Need help? Reply to this email or visit <a href="https://bookd.vip" style="color:#2c5364;">bookd.vip</a>.
              </p>

            </div>

            <!-- Footer -->
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