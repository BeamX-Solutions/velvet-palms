import QRCode from 'qrcode';
import { siteUrl } from '@/lib/config';

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^VP-[A-Z0-9]{8}$/.test(code)) return new Response('Not found', { status: 404 });
  // The QR opens the staff check-in page (protected by the admin login).
  const png = await QRCode.toBuffer(`${siteUrl}/admin/checkin/${code}`, {
    width: 360, margin: 1, color: { dark: '#011c13', light: '#efe7d3' },
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
