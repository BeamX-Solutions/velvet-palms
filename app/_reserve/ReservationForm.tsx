'use client';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { reserveAction, waitlistAction, type FormState } from './actions';

type SittingView = { id: number; label: string; time: string; seatsLeft: number; capacity: number; open: boolean };

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending} style={{ width: '100%' }}>
      {pending ? 'One moment…' : children}
    </button>
  );
}

function Field({ name, label, err, children }: { name: string; label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {err && <div className="err" id={`${name}-err`}>{err}</div>}
    </div>
  );
}

function useStartedAt() {
  const [t, setT] = useState('');
  useEffect(() => setT(String(Date.now())), []);
  return t;
}

function Bot({ startedAt }: { startedAt: string }) {
  return (
    <>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="hp" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
    </>
  );
}

function Contact({ fe, v, maxParty }: { fe?: FormState['fieldErrors']; v?: FormState['values']; maxParty: number }) {
  return (
    <>
      <Field name="fullName" label="Full name" err={fe?.fullName}>
        <input id="fullName" name="fullName" defaultValue={v?.fullName} autoComplete="name" required aria-invalid={!!fe?.fullName} />
      </Field>
      <div className="row2">
        <Field name="email" label="Email" err={fe?.email}>
          <input id="email" name="email" defaultValue={v?.email} type="email" autoComplete="email" required aria-invalid={!!fe?.email} />
        </Field>
        <Field name="phone" label="Phone (WhatsApp)" err={fe?.phone}>
          <input id="phone" name="phone" defaultValue={v?.phone} type="tel" autoComplete="tel" placeholder="0803 000 0000" required aria-invalid={!!fe?.phone} />
        </Field>
      </div>
      <Field name="partySize" label="Number of guests" err={fe?.partySize}>
        <select id="partySize" name="partySize" defaultValue={v?.partySize ?? '2'}>
          {Array.from({ length: maxParty }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </Field>
    </>
  );
}

export default function ReservationForm({ sittings, maxParty }: { sittings: SittingView[]; maxParty: number }) {
  const startedAt = useStartedAt();
  const available = sittings.filter((s) => s.open && s.seatsLeft > 0);
  const [state, action] = useActionState(reserveAction, { status: 'idle' } as FormState);
  const [wState, wAction] = useActionState(waitlistAction, { status: 'idle' } as FormState);

  if (available.length === 0) {
    if (wState.status === 'waitlisted') return <div className="notice">{wState.message}</div>;
    return (
      <form key={wState.at ?? 0} action={wAction} className="form" noValidate>
        <div className="notice">
          <strong className="gold">Opening Night is fully reserved.</strong> Leave your details and we will contact you
          if a seat becomes available.
        </div>
        {wState.status === 'error' && <div className="notice error" role="alert">{wState.message}</div>}
        <Contact fe={wState.fieldErrors} v={wState.values} maxParty={maxParty} />
        <Bot startedAt={startedAt} />
        <Submit>Join the opening night waitlist</Submit>
      </form>
    );
  }

  return (
    <form key={state.at ?? 0} action={action} className="form" noValidate>
      {state.status === 'error' && <div className="notice error" role="alert">{state.message}</div>}
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ padding: 0, fontSize: '0.68rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
          Choose your sitting
        </legend>
        <div className="sitting-options">
          {sittings.map((s) => {
            const disabled = !s.open || s.seatsLeft === 0;
            return (
              <label key={s.id} className="sitting-option">
                <input type="radio" name="sittingId" value={s.id} disabled={disabled}
                  defaultChecked={!disabled && (state.values?.sittingId ? String(s.id) === state.values.sittingId : s.id === available[0]?.id)} />
                <span className="box">
                  <span className="time">{s.time}</span>
                  <span className="muted" style={{ fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>{s.label}</span>
                  <span className="left">{disabled ? (s.open ? 'Fully reserved' : 'Closed') : `${s.seatsLeft} seats left`}</span>
                  <span className="meter"><i style={{ width: `${100 - (s.seatsLeft / s.capacity) * 100}%` }} /></span>
                </span>
              </label>
            );
          })}
        </div>
        {state.fieldErrors?.sittingId && <div className="field"><div className="err">{state.fieldErrors.sittingId}</div></div>}
      </fieldset>

      <Contact fe={state.fieldErrors} v={state.values} maxParty={maxParty} />

      <div className="row2">
        <Field name="occasion" label="Occasion (optional)">
          <select id="occasion" name="occasion" defaultValue={state.values?.occasion ?? ''}>
            <option value="">None</option>
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Business</option>
            <option>Date night</option>
            <option>Celebration</option>
          </select>
        </Field>
        <Field name="notes" label="Dietary needs or notes (optional)" err={state.fieldErrors?.notes}>
          <input id="notes" name="notes" maxLength={300} defaultValue={state.values?.notes} />
        </Field>
      </div>

      <Bot startedAt={startedAt} />
      <Submit>Reserve for Opening Night</Submit>
      <p className="muted center" style={{ fontSize: '0.82rem', margin: 0 }}>
        Reservations are for Opening Night only and free of charge. One booking per email and phone number.
        You will receive a confirmation with your entry code.
      </p>
    </form>
  );
}
