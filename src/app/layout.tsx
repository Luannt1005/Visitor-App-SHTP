import "./globals.css";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export const metadata = {
  title: "MIL | Global Visitor Pass Registration",
  description: "Modern Visitor Management System for Factory and Office Access",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let user = null;

  if (token) {
    try {
      user = await verifyAuth(token);
    } catch (e) {
      console.error("Auth verification failed in layout", e);
    }
  }

  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)'
        }}>
          <nav className="container" style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link href="/" className="heading" style={{ fontSize: '1.5rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 800 }}>
              MIL<span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>PASS</span>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              {user?.role === 'ADMIN' && <Link href="/admin" className="nav-link">Admin Portal</Link>}

              {!user ? (
                <>
                  <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Login</Link>
                  <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</Link>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>{user.name || user.email.split('@')[0]}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
                  </div>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                  }}>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 0', background: '#ffffff', marginTop: '4rem' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              © 2026 MIL SHTP Facility. All Rights Reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" className="nav-link">Privacy Policy</a>
              <a href="#" className="nav-link">Terms of Service</a>
              <a href="#" className="nav-link">Contact Support</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
