import { redirect } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import { getSession } from '@/lib/auth';
import { adminConfigured, safeNext } from '@/lib/session';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Staff sign in', robots: { index: false } };

export default async function StaffLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <div className="staff-login">
      <div className="staff-login__card form-card">
        <BrandLogo className="staff-login__mark" compact title="Velvet Palms" />
        <p className="eyebrow">Staff only</p>
        <h1 className="display">The door</h1>
        <p className="staff-login__lede">
          {next.startsWith('/admin/checkin') ? 'Sign in to check this guest in.' : 'Sign in to see the guest list.'}
        </p>
        {adminConfigured() ? <LoginForm next={next} />
          : <p className="notice notice--error">Staff sign-in is not set up yet. Add ADMIN_USER and ADMIN_PASSWORD to the site settings.</p>}
      </div>
    </div>
  );
}
