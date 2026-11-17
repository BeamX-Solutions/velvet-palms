'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { createStaff, updateStaff, type FormState } from './actions';

type Member = { id: number; username: string; display_name: string; role: 'admin' | 'door'; active: boolean };

/** A readable random password: three groups of four, no look-alike characters. */
function generatePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const s = Array.from(bytes, (b) => chars[b % chars.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

function PasswordField({ id, label = 'Password', resetKey }: { id: string; label?: string; resetKey?: number }) {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => { setValue(''); setShow(false); }, [resetKey]);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="staff-login__pw staff-pw">
        <input id={id} name="password" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8}
          value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button" className="staff-login__show mono staff-pw__gen" onClick={() => { setValue(generatePassword()); setShow(true); }}>
          Generate
        </button>
        <button type="button" className="staff-login__show mono" onClick={() => setShow((s) => !s)} aria-pressed={show}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

function Message({ state }: { state: FormState }) {
  if (state.error) return <p className="notice notice--error" role="alert">{state.error}</p>;
  if (state.ok) return <p className="notice" role="status">{state.ok}</p>;
  return null;
}

export function AddStaffForm() {
  const [state, action, pending] = useActionState(createStaff, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state]);
  return (
    <form ref={formRef} action={action} className="form form-card staff-add">
      <h2 className="display">Add a staff member</h2>
      <div className="row2">
        <div className="field">
          <label htmlFor="new-name">Name</label>
          <input id="new-name" name="name" required maxLength={60} placeholder="e.g. Ada Okafor" />
        </div>
        <div className="field">
          <label htmlFor="new-username">Username</label>
          <input id="new-username" name="username" required minLength={3} maxLength={32} autoCapitalize="none" spellCheck={false}
            pattern="[A-Za-z0-9._\-]+" title="Letters, numbers, dots, dashes and underscores" placeholder="e.g. ada" />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="new-role">Role</label>
          <select id="new-role" name="role" defaultValue="door">
            <option value="door">Door staff: check-in and search only</option>
            <option value="admin">Admin: everything, including staff</option>
          </select>
        </div>
        <PasswordField id="new-password" resetKey={state.key} />
      </div>
      <Message state={state} />
      <div><button className="btn" disabled={pending}>{pending ? 'Adding…' : 'Add staff member'}</button></div>
      <p className="staff-add__hint">Share the username and password with them in person or by message. You can change either later.</p>
    </form>
  );
}

/** The expandable "Manage" panel for one person. */
export function ManageStaff({ member, isSelf }: { member: Member; isSelf: boolean }) {
  const [state, action, pending] = useActionState(updateStaff, {});
  const [confirmRemove, setConfirmRemove] = useState(false);
  const hidden = <input type="hidden" name="id" value={member.id} />;

  return (
    <details className="staff-manage">
      <summary className="btn btn--line btn--small">Manage</summary>
      <div className="staff-manage__panel">
        <Message state={state} />

        <form action={action} className="staff-manage__row">
          {hidden}<input type="hidden" name="op" value="rename" />
          <div className="field"><label htmlFor={`name-${member.id}`}>Name</label>
            <input id={`name-${member.id}`} name="name" defaultValue={member.display_name} required maxLength={60} /></div>
          <button className="btn btn--line btn--small" disabled={pending}>Save name</button>
        </form>

        {!isSelf && (
          <form action={action} className="staff-manage__row">
            {hidden}<input type="hidden" name="op" value="role" />
            <div className="field"><label htmlFor={`role-${member.id}`}>Role</label>
              <select id={`role-${member.id}`} name="role" defaultValue={member.role}>
                <option value="door">Door staff</option>
                <option value="admin">Admin</option>
              </select></div>
            <button className="btn btn--line btn--small" disabled={pending}>Change role</button>
          </form>
        )}

        <form action={action} className="staff-manage__row">
          {hidden}<input type="hidden" name="op" value="password" />
          <PasswordField id={`pw-${member.id}`} label={isSelf ? 'New password for you' : 'New password'} resetKey={state.key} />
          <button className="btn btn--line btn--small" disabled={pending}>Set password</button>
        </form>

        {!isSelf && (
          <div className="staff-manage__danger">
            <form action={action}>
              {hidden}<input type="hidden" name="op" value={member.active ? 'pause' : 'activate'} />
              <button className="btn btn--line btn--small" disabled={pending}>{member.active ? 'Pause access' : 'Reactivate'}</button>
            </form>
            {!confirmRemove ? (
              <button type="button" className="link" onClick={() => setConfirmRemove(true)}>Remove {member.display_name}</button>
            ) : (
              <form action={action} className="staff-manage__confirm">
                {hidden}<input type="hidden" name="op" value="remove" />
                <span>Remove for good?</span>
                <button className="btn btn--small staff-manage__remove" disabled={pending}>Yes, remove</button>
                <button type="button" className="link" onClick={() => setConfirmRemove(false)}>Keep</button>
              </form>
            )}
          </div>
        )}
        {isSelf && <p className="staff-add__hint">This is you. Another admin, or the owner login, can change your role or remove you.</p>}
      </div>
    </details>
  );
}
