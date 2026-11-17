import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fmtDateTime } from '@/lib/format';
import { listStaff, type StaffMember } from '@/lib/staff';
import { AddStaffForm, ManageStaff } from './StaffForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Staff', robots: { index: false } };

export default async function Staff() {
  const me = await getSession();
  if (!me) redirect('/admin/login?next=%2Fadmin%2Fstaff');
  if (me.role !== 'admin') redirect('/admin');

  let staff: StaffMember[] | null = null;
  try { staff = await listStaff(); } catch (e) { console.error('staff list unavailable', e); }

  return (
    <div className="door-list staff-page">
      <header>
        <h1 className="display">Staff</h1>
        <Link href="/admin" className="link">Back to guest list</Link>
      </header>
      <p className="muted staff-page__intro">
        Door staff can check guests in and search the list by name or code. Admins can do everything, including managing staff.
        Changing someone&rsquo;s role or password, or pausing them, signs them out straight away.
      </p>

      {staff === null ? (
        <p className="notice notice--error">
          Staff accounts are not set up in the database yet. Run <code>npm run db:setup</code> once, then reload this page.
        </p>
      ) : (
        <>
          <AddStaffForm />

          <div className="door-list__scroll"><table className="staff-table">
            <thead><tr className="mono"><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Last sign-in</th><th /></tr></thead>
            <tbody>
              <tr>
                <td className="door-list__name">Owner{me.isOwner && <small> (you)</small>}</td>
                <td className="mono">{process.env.ADMIN_USER}</td>
                <td><span className="pill">Admin</span></td>
                <td><span className="pill pill--ok">Built in</span></td>
                <td data-label="Last sign-in"><small>—</small></td>
                <td><small>Set in the hosting settings (ADMIN_USER / ADMIN_PASSWORD).</small></td>
              </tr>
              {staff.length === 0 && (
                <tr><td colSpan={6} className="door-list__empty">No staff added yet. Add your door team above.</td></tr>
              )}
              {staff.map((s) => (
                <tr key={s.id} className={s.active ? '' : 'is-paused'}>
                  <td>
                    <span className="door-list__name">{s.display_name}</span>{me.staffId === s.id && <small> (you)</small>}
                    <br /><small>Added {fmtDateTime(s.created_at)}{s.created_by ? ` by ${s.created_by}` : ''}</small>
                  </td>
                  <td className="mono">{s.username}</td>
                  <td><span className="pill">{s.role === 'admin' ? 'Admin' : 'Door staff'}</span></td>
                  <td><span className={`pill ${s.active ? 'pill--ok' : ''}`}>{s.active ? 'Active' : 'Paused'}</span></td>
                  <td data-label="Last sign-in"><small>{s.last_login_at ? fmtDateTime(s.last_login_at) : 'Never'}</small></td>
                  <td>
                    <ManageStaff
                      member={{ id: s.id, username: s.username, display_name: s.display_name, role: s.role, active: s.active }}
                      isSelf={me.staffId === s.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </div>
  );
}
