'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { event } from '@/lib/config';
import { getReservation, joinWaitlist, normalisePhone, reserve } from '@/lib/reservations';
import { sendConfirmation } from '@/lib/email';

export type FormState = {
  status: 'idle' | 'error' | 'waitlisted';
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string>; // echoed back so the form keeps what the guest typed
  at?: number; // changes on every response so the form remounts with those values
};

const keep = (fd: FormData) => {
  const v: Record<string, string> = {};
  for (const k of ['fullName', 'email', 'phone', 'partySize', 'sittingId', 'occasion', 'notes']) {
    const x = fd.get(k); if (typeof x === 'string') v[k] = x;
  }
  return v;
};

const base = {
  fullName: z.string().trim().min(2, 'Please enter your full name').max(80),
  email: z.string().trim().email('Please enter a valid email').max(120),
  phone: z.string().trim().transform(normalisePhone)
    .refine((p) => p.length >= 10 && p.length <= 15, 'Please enter a valid phone number'),
  partySize: z.coerce.number().int().min(1).max(event.openingNight.maxPartySize),
};

const ReserveSchema = z.object({
  ...base,
  sittingId: z.coerce.number({ message: 'Choose a sitting' }).int().positive('Choose a sitting'),
  occasion: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(300, 'Keep notes under 300 characters').optional(),
});

function isBot(fd: FormData) {
  if (fd.get('website')) return true; // honeypot
  const started = Number(fd.get('startedAt'));
  return !started || Date.now() - started < 2500; // submitted inhumanly fast
}

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

export async function reserveAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { status: 'error', message: 'Something went wrong. Please try again.' };
  const parsed = ReserveSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors: fieldErrors(parsed.error), values: keep(fd), at: Date.now() };

  const d = parsed.data;
  const result = await reserve({ ...d, occasion: d.occasion || undefined, notes: d.notes || undefined });

  if (!result.ok) {
    const messages: Record<string, string> = {
      full: result.seatsLeft
        ? `Only ${result.seatsLeft} seat${result.seatsLeft === 1 ? '' : 's'} left in that sitting. Try a smaller party or the other sitting.`
        : 'That sitting is now full. Please choose the other sitting or join the waitlist.',
      closed: 'Reservations for that sitting are closed.',
      duplicate: 'There is already a reservation under this email or phone number. Check your email for your confirmation.',
      no_sitting: 'Please choose a sitting.',
      error: 'We could not complete your reservation. Please try again in a moment.',
    };
    revalidatePath('/');
    return { status: 'error', message: messages[result.reason], values: keep(fd), at: Date.now() };
  }

  const r = await getReservation(result.code);
  if (r) await sendConfirmation(r);
  revalidatePath('/');
  redirect(`/reservation/${result.code}?new=1`);
}

const WaitlistSchema = z.object(base);

export async function waitlistAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { status: 'error', message: 'Something went wrong. Please try again.' };
  const parsed = WaitlistSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors: fieldErrors(parsed.error), values: keep(fd), at: Date.now() };
  try {
    await joinWaitlist(parsed.data);
  } catch (e) {
    console.error(e);
    return { status: 'error', message: 'We could not add you to the waitlist. Please try again.', values: keep(fd), at: Date.now() };
  }
  return { status: 'waitlisted', message: "You're on the waitlist. If a seat opens up, we'll contact you first." };
}
