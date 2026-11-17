'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { cancelReservation, setCheckedIn, setSittingOpen } from '@/lib/reservations';

// Server actions are callable by ID, so each one re-checks the session and role itself.

export async function toggleCheckIn(code: string, checkedIn: boolean) {
  await requireRole('admin', 'door');
  await setCheckedIn(code, checkedIn);
  revalidatePath('/admin');
  revalidatePath(`/admin/checkin/${code}`);
}

export async function adminCancel(code: string) {
  await requireRole('admin');
  await cancelReservation(code);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function toggleSitting(id: number, open: boolean) {
  await requireRole('admin');
  await setSittingOpen(id, open);
  revalidatePath('/admin');
  revalidatePath('/');
}
