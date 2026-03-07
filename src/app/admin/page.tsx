'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests);
            } else if (res.status === 401 || res.status === 403) {
                router.push('/login');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/admin/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETE':
            case 'APPROVED': return '#10b981';
            case 'REJECTED': return '#ef4444';
            case 'IN PROCESS': return '#f59e0b';
            default: return '#94a3b8';
        }
    };

    const handleUpdateRoomStatus = async (approvalId: string, status: string) => {
        try {
            const res = await fetch('/api/admin/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'ROOM_APPROVAL', approvalId, status }),
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                    <p style={{ color: '#94a3b8' }}>Overall management of visitor requests and factory access areas.</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <Link href="/admin/rooms" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                        Manage Rooms & Emails
                    </Link>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                        Switch to User View
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '1.5rem' }}>Visitor</th>
                            <th style={{ padding: '1.5rem' }}>Submitter</th>
                            <th style={{ padding: '1.5rem' }}>Dates</th>
                            <th style={{ padding: '1.5rem' }}>Approval Workflow</th>
                            <th style={{ padding: '1.5rem' }}>Overall Status</th>
                            <th style={{ padding: '1.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.875rem' }}>
                        {requests.map((request) => (
                            <tr key={request.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{request.visitor_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{request.current_company} / {request.visitor_title}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div>{request.profiles?.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{request.profiles?.department}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    {request.request_approvals?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {request.request_approvals.map((app: any) => (
                                                <div key={app.id} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: getStatusColor(app.status) }}>●</span> {app.room_areas?.name}: {app.approver_email} - {app.status}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#64748b' }}>No workflow</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: getStatusColor(request.status) + '22',
                                        color: getStatusColor(request.status),
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {request.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleUpdateStatus(request.id, 'COMPLETE')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981' }}>Approve</button>
                                        <button onClick={() => handleUpdateStatus(request.id, 'REJECTED')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && !loading && (
                            <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No visitor requests found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
