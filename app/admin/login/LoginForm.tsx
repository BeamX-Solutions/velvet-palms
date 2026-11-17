'use client';
import { useActionState, useState } from 'react';
import { login } from './actions';

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="form staff-login__form">
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="user">Staff name</label>
        <input id="user" name="user" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="staff-login__pw">
          <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required />
          <button type="button" className="staff-login__show mono" onClick={() => setShow((s) => !s)} aria-pressed={show}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? 'Checking…' : 'Enter'}</button>
    </form>
  );
}
