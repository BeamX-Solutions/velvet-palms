'use client';
import { useTransition } from 'react';
import { adminCancel, toggleCheckIn, toggleSitting } from './actions';

export function CheckInButton({ code, checkedIn, big }: { code: string; checkedIn: boolean; big?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className={`btn ${big ? 'btn--big' : 'btn--small'} ${checkedIn ? 'btn--line' : 'btn--gold'}`} disabled={pending}
      onClick={() => start(() => toggleCheckIn(code, !checkedIn))}>
      {pending ? '…' : checkedIn ? 'Undo check-in' : 'Check in'}
    </button>
  );
}

export function CancelButton({ code, name }: { code: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="btn btn--line btn--small" disabled={pending}
      onClick={() => confirm(`Cancel ${name}'s reservation and release the seats?`) && start(() => adminCancel(code))}>
      {pending ? '…' : 'Cancel'}
    </button>
  );
}

export function SittingToggle({ id, open }: { id: number; open: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="btn btn--line btn--small" disabled={pending} onClick={() => start(() => toggleSitting(id, !open))}>
      {pending ? '…' : open ? 'Close bookings' : 'Reopen bookings'}
    </button>
  );
}
