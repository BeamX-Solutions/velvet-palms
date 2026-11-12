'use server';
import { revalidatePath } from 'next/cache';
import { cancelReservation, setCheckedIn, setSittingOpen } from '@/lib/reservations';

// These run only behind the /admin basic-auth gate (middleware), but server actions
// are callable by ID, so re-check the credentials here too.
import { headers } from 'next/headers';
async function assertAdmin() {
  const h = (await headers()).get('authorization') ?? '';
  const [scheme, enc] = h.split(' ');
  const ok = scheme === 'Basic' && enc && (() => {
    const [u, ...p] = Buffer.from(enc, 'base64').toString().split(':');
    return u === process.env.ADMIN_USER && p.join(':') === process.env.ADMIN_PASSWORD;
  })();
  if (!ok) throw new Error('Unauthorised');
}

export async function toggleCheckIn(code: string, checkedIn: boolean) {
  await assertAdmin();
  await setCheckedIn(code, checkedIn);
  revalidatePath('/admin');
  revalidatePath(`/admin/checkin/${code}`);
}

export async function adminCancel(code: string) {
  await assertAdmin();
  await cancelReservation(code);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function toggleSitting(id: number, open: boolean) {
  await assertAdmin();
  await setSittingOpen(id, open);
  revalidatePath('/admin');
  revalidatePath('/');
}
