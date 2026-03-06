'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests);
            } else if (res.status === 401) {
                router.push('/login');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const parseDetails = (details: any) => {
        if (!details) return {};
        if (typeof details === 'object') return details;
        try {
            return JSON.parse(details);
        } catch (e) {
            console.error("Error parsing details JSON", e);
            return {};
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return '#10b981'; // Green
            case 'REJECTED': return '#ef4444'; // Red
            default: return '#f59e0b'; // Amber
        }
    };

    const handleLogout = () => {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="container" style={{ marginTop: '3rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Applications</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track and manage your factory visitor registrations.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/dashboard/new-request" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '14px' }}>
                        + Create New Request
                    </Link>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ borderRadius: '14px' }}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Visitor / Company</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Visit Period</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Workflows</th>
                            <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Overall Status</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.925rem' }}>
                        {requests.map((request) => (
                            <tr
                                key={request.id}
                                className="table-row"
                                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                onClick={() => setSelectedRequest(request)}
                            >
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{request.visitor_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{request.current_company}</div>
                                </td>
                                <td style={{ padding: '1.5rem', color: 'var(--text-main)' }}>
                                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {request.request_approvals?.map((app: any) => (
                                            <div
                                                key={app.id}
                                                title={`${app.room_areas?.name}: ${app.status}`}
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: getStatusColor(app.status),
                                                    boxShadow: `0 0 6px ${getStatusColor(app.status)}55`
                                                }}
                                            />
                                        ))}
                                        {(!request.request_approvals || request.request_approvals.length === 0) && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No areas requested</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '30px',
                                        background: getStatusColor(request.status) + '15',
                                        color: getStatusColor(request.status),
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}>
                                        {request.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>View Details →</span>
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                                    No requests found. Start by creating a new visit application.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL OVERLAY */}
            {selectedRequest && (() => {
                const details = parseDetails(selectedRequest.details);
                return (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 100
                        }}
                        onClick={() => setSelectedRequest(null)}
                    >
                        <div
                            className="glass-panel"
                            style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', padding: '0', position: 'relative' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                                <h2 className="heading" style={{ fontSize: '1.25rem' }}>Application Details</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    &times;
                                </button>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{selectedRequest.visitor_name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{selectedRequest.visitor_title} @ {selectedRequest.current_company}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            padding: '8px 18px',
                                            borderRadius: '30px',
                                            background: getStatusColor(selectedRequest.status) + '15',
                                            color: getStatusColor(selectedRequest.status),
                                            fontSize: '0.85rem',
                                            fontWeight: 800
                                        }}>
                                            {selectedRequest.status}
                                        </span>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Ref: {selectedRequest.id.split('-')[0].toUpperCase()}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Visit Dates</label>
                                        <p style={{ fontWeight: 600 }}>{new Date(selectedRequest.start_date).toLocaleDateString()} — {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Visit Purpose</label>
                                        <p style={{ fontWeight: 600 }}>{selectedRequest.purpose_of_visit}</p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Visitor Category</label>
                                        <p style={{ fontWeight: 600 }}>{selectedRequest.visitor_category}</p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Cost Center</label>
                                        <p style={{ fontWeight: 600 }}>{details.costCenter || 'N/A'}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Area Approvals</label>
                                    <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                        {selectedRequest.request_approvals?.map((app: any, idx: number) => (
                                            <div key={app.id} style={{
                                                padding: '1.25rem 1.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: idx === selectedRequest.request_approvals.length - 1 ? 'none' : '1px solid var(--border)'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{app.room_areas?.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approver: <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{app.approver_email}</span></div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        color: getStatusColor(app.status),
                                                        textTransform: 'uppercase',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(app.status) }} />
                                                        {app.status}
                                                    </span>
                                                    {app.acted_at && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Processed on {new Date(app.acted_at).toLocaleDateString()}</div>}
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedRequest.request_approvals || selectedRequest.request_approvals.length === 0) && (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No specific areas were selected for this request.</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Factory Tour</label>
                                        <p style={{ fontWeight: 600 }}>{details.factoryTour || 'No'}</p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Meal Registration</label>
                                        <p style={{ fontWeight: 600 }}>{details.mealRegistration || 'No'}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderRadius: '0 0 20px 20px' }}>
                                <button onClick={() => setSelectedRequest(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>Close</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style jsx>{`
        .table-row:hover {
          background: #f8fafc;
        }
      `}</style>
        </div>
    );
}
