import 'server-only';
import { Resend } from 'resend';
import { event, siteUrl } from './config';
import { fmtDate, fmtTime } from './format';
import type { Reservation } from './reservations';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendConfirmation(r: Reservation) {
  const key = process.env.RESEND_API_KEY;
  const link = `${siteUrl}/reservation/${r.code}`;
  if (!key) {
    console.info(`[email skipped: no RESEND_API_KEY] ${r.email} -> ${link}`);
    return;
  }
  const html = `
  <div style="background:#011c13;padding:40px 16px;font-family:Georgia,serif;color:#efe7d3">
    <div style="max-width:520px;margin:0 auto;border:1px solid #6b5a36;padding:36px 28px;text-align:center">
      <p style="letter-spacing:4px;font-size:12px;color:#b89b5e;margin:0 0 8px">VELVET PALMS</p>
      <h1 style="font-weight:normal;font-size:28px;margin:0 0 20px">Your table awaits, ${esc(r.full_name.split(' ')[0])}.</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">
        Opening Night &middot; ${fmtDate(r.starts_at)}<br/>
        ${esc(r.sitting_label)} at ${fmtTime(r.starts_at)} &middot; ${r.party_size} ${r.party_size === 1 ? 'guest' : 'guests'}
      </p>
      <img src="${siteUrl}/api/qr/${r.code}" width="180" height="180" alt="Reservation QR code" style="background:#efe7d3;padding:10px"/>
      <p style="font-family:monospace;font-size:18px;letter-spacing:3px;color:#b89b5e;margin:16px 0 24px">${r.code}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 24px">Show this code at the door. Dress code: ${esc(event.openingNight.dressCode)}</p>
      <a href="${link}" style="display:inline-block;border:1px solid #b89b5e;color:#b89b5e;padding:12px 24px;text-decoration:none;letter-spacing:2px;font-size:12px">VIEW OR CANCEL RESERVATION</a>
      <p style="font-size:12px;color:#9d9583;margin:28px 0 0">${esc(event.city)}</p>
    </div>
  </div>`;
  try {
    await new Resend(key).emails.send({
      from: process.env.EMAIL_FROM ?? 'Velvet Palms <onboarding@resend.dev>',
      to: r.email,
      subject: `Opening Night reservation confirmed: ${r.code}`,
      html,
    });
  } catch (e) {
    console.error('email failed', e); // never block the booking on email
  }
}
