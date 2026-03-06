'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserProfile({ user }: { user: { name?: string, email: string, role: string } }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
        router.refresh();
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                        {user.name || user.email.split('@')[0]}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {user.role}
                    </span>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'white',
                    color: '#db011c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '180px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '0.5rem',
                    zIndex: 60,
                    border: '1px solid var(--border)'
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fff1f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        <span style={{ fontSize: '1.1rem' }}>➡️</span> Logout
                    </button>
                </div>
            )}
        </div>
    );
}
