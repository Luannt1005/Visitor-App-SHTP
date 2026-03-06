import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // If no token, redirect to login which will then redirect back to new-request
  const requestLink = token ? "/dashboard/new-request" : "/login?redirect=/dashboard/new-request";

  return (
    <div className="container" style={{ padding: '6rem 2rem' }}>
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="heading" style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
          Visitor Registration <br />
          <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Simplified.</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Access the facility securely with our automated pass registration system. Choose areas, manage meals, and track your approval status in real-time.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href={requestLink} className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.25rem', borderRadius: '50px', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)', textDecoration: 'none', fontWeight: 700 }}>
            Create Visitor Request
          </Link>
        </div>
      </section>

      <section style={{
        marginTop: '8rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏢</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Multi-Area Access</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select specific factory areas, from AME Workshops to MIL Offices, with automated approval routing.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Real-time Tracking</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Monitor your request status and see exactly which department heads have approved your visit.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛠️</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Admin Power</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Administrators can manage room databases, assign approver emails, and oversee all facility logistics.
          </p>
        </div>
      </section>
    </div>
  );
}
