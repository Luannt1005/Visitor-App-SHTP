import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // If no token, redirect to login which will then redirect back to new-request
  const requestLink = token ? "/dashboard/new-request" : "/login?redirect=/dashboard/new-request";

  return (
    <div className="container" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <section style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto', marginBottom: '3rem' }}>
        <h1 className="heading" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          FACTORY ENTRY REGISTRATION<br />
          <span style={{ color: '#db011c' }}>MILWAUKEE SHTP STAGING</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto' }}>
          Access the facility securely with our automated pass registration system. Choose areas, manage meals, and track your approval status in real-time.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <Link href={requestLink} className="btn" style={{
            padding: '1.25rem 3.5rem',
            fontSize: '1.25rem',
            borderRadius: '50px',
            background: '#db011c',
            color: 'white',
            boxShadow: '0 10px 25px -5px rgba(219, 1, 28, 0.4)',
            textDecoration: 'none',
            fontWeight: 700,
            transition: 'all 0.3s'
          }}>
            Create Visitor Request
          </Link>
        </div>
      </section>

      <section style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border)'
        }}>
          <img
            src="/home bg.png"
            alt="Factory Environment"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </section>
    </div>
  );
}
