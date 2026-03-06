'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminRoomsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [newRoom, setNewRoom] = useState({ category: 'Common Office', name: '', approver_email: '' });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/rooms');
        if (res.ok) {
            const data = await res.json();
            setRooms(data.rooms);
        }
        setLoading(false);
    };

    const handleUpdate = async (id: string, updates: any) => {
        const res = await fetch('/api/admin/rooms', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        if (res.ok) {
            fetchRooms();
            setEditingRoom(null);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRoom),
        });
        if (res.ok) {
            fetchRooms();
            setNewRoom({ category: 'Common Office', name: '', approver_email: '' });
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Rooms & Approvers</h1>
                    <p style={{ color: '#94a3b8' }}>Assign specific approver emails to each factory area.</p>
                </div>
                <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                    Back to Dashboard
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
                {/* ADD NEW ROOM */}
                <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'white' }}>Add New Room</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label>Category</label>
                            <select className="input-field" value={newRoom.category} onChange={e => setNewRoom({ ...newRoom, category: e.target.value })}>
                                <option>Common Office</option>
                                <option>AME</option>
                                <option>ENG</option>
                                <option>EE/MT</option>
                                <option>MFG</option>
                                <option>Shipping</option>
                                <option>Quality QM</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Room Name</label>
                            <input type="text" className="input-field" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} placeholder="e.g. Share Function Office L6M" required />
                        </div>
                        <div className="form-group">
                            <label>Approver Email</label>
                            <input type="email" className="input-field" value={newRoom.approver_email} onChange={e => setNewRoom({ ...newRoom, approver_email: e.target.value })} placeholder="manager@example.com" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Create Room</button>
                    </form>
                </div>

                {/* ROOM LIST */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '1.5rem' }}>Category</th>
                                    <th style={{ padding: '1.5rem' }}>Room Name</th>
                                    <th style={{ padding: '1.5rem' }}>Approver Email</th>
                                    <th style={{ padding: '1.5rem' }}>Status</th>
                                    <th style={{ padding: '1.5rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.875rem' }}>
                                {rooms.map((room) => (
                                    <tr key={room.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{ fontSize: '0.65rem', padding: '4px 10px', borderRadius: '20px', background: 'var(--primary-dark)', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                {room.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>{room.name}</td>
                                        <td style={{ padding: '1.25rem', color: '#cbd5e1' }}>
                                            {editingRoom?.id === room.id ? (
                                                <input type="email" className="input-field" style={{ padding: '0.5rem', marginBottom: '0' }} defaultValue={room.approver_email} onBlur={(e) => handleUpdate(room.id, { approver_email: e.target.value })} />
                                            ) : (
                                                <span>{room.approver_email || 'Not set'}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{ color: room.is_active ? '#4ade80' : '#f87171' }}>{room.is_active ? '● Active' : '○ Inactive'}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <button onClick={() => setEditingRoom(room)} className="accent-text" style={{ cursor: 'pointer', background: 'none' }}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                                {rooms.length === 0 && !loading && (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No rooms found. Add your first room area.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
