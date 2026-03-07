import "./globals.css";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import UserProfile from '@/components/UserProfile';

export const metadata = {
  title: "MIL | Factory Entry Registration",
  description: "Milwaukee SHTP Staging - Modern Visitor Management System",
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
          background: 'linear-gradient(135deg, #db011c 0%, #900112 100%)',
          boxShadow: '0 4px 20px rgba(219, 1, 28, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <nav className="container nav-container" style={{
            height: '75px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/milwaukee_logo.png"
                alt="Milwaukee Logo"
                style={{ height: '45px', objectFit: 'contain' }}
              />
            </Link>

            <div className="nav-links-wrapper" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link href="/dashboard" className="nav-link" style={{ color: 'white', fontWeight: 600 }}>My Request</Link>
              {user?.role === 'ADMIN' && <Link href="/admin" className="nav-link" style={{ color: 'white', fontWeight: 600 }}>Admin Portal</Link>}

              {!user ? (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link href="/login" style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s'
                  }}>Login</Link>
                  <Link href="/register" style={{
                    background: 'white',
                    color: '#db011c',
                    textDecoration: 'none',
                    fontWeight: 700,
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>Sign Up</Link>
                </div>
              ) : (
                <UserProfile user={user} />
              )}
            </div>
          </nav>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 0', background: '#fcfcfc', marginTop: '4rem' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              © 2026 Milwaukee Tool SHTP Facility. All Rights Reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" className="nav-link">Privacy Policy</a>
              <a href="#" className="nav-link">Terms</a>
              <a href="#" className="nav-link">Support</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
