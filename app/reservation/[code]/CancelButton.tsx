'use client';
import { useTransition } from 'react';
import { cancelAction } from './actions';

export default function CancelButton({ code }: { code: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn ghost small"
      disabled={pending}
      onClick={() => {
        if (confirm('Cancel this reservation? Your seats will be released to other guests.')) start(() => cancelAction(code));
      }}
    >
      {pending ? 'Cancelling…' : 'Cancel reservation'}
    </button>
  );
}
