'use server';
import { revalidatePath } from 'next/cache';
import { cancelReservation } from '@/lib/reservations';

export async function cancelAction(code: string) {
  await cancelReservation(code);
  revalidatePath(`/reservation/${code}`);
  revalidatePath('/');
}
