'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorTitle: '',
        currentCompany: '',
        startDate: '',
        endDate: '',
        purposeOfVisit: 'Business / Meeting',
        visitorCategory: 'Vendor',
        details: {
            factoryTour: 'No',
            mealRegistration: 'No',
            costCenter: ''
        },
        roomIds: [] as string[]
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/admin/rooms');
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data.rooms);
                }
            } catch (err) {
                console.error("Failed to fetch rooms", err);
            }
        };
        fetchRooms();
    }, []);

    // Clear room selections if the category is changed to something other than Expat/Business trip
    useEffect(() => {
        if (formData.visitorCategory !== 'MIL/TTI Expat / SHTP Business trip') {
            setFormData(prev => ({ ...prev, roomIds: [] }));
        }
    }, [formData.visitorCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Visitor pass successfully requested!');
                router.push('/dashboard');
                router.refresh();
            } else {
                const error = await res.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            alert('Internal Server Error');
        } finally {
            setLoading(false);
        }
    };

    const updateDetails = (key: string, value: any) => {
        setFormData({ ...formData, details: { ...formData.details, [key]: value } });
    };

    const toggleRoom = (id: string) => {
        setFormData(prev => ({
            ...prev,
            roomIds: prev.roomIds.includes(id)
                ? prev.roomIds.filter(rid => rid !== id)
                : [...prev.roomIds, id]
        }));
    };

    const groupedRooms = rooms.reduce((acc: any, room: any) => {
        if (!acc[room.category]) acc[room.category] = [];
        acc[room.category].push(room);
        return acc;
    }, {});

    const isExpatCategory = formData.visitorCategory === 'MIL/TTI Expat / SHTP Business trip';

    return (
        <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
            <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '2rem' }}>New Visitor Registration</h1>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', background: '#ffffff' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Basic Information</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Visitor's Full Name *</label>
                        <input type="text" className="input-field" required value={formData.visitorName} onChange={e => setFormData({ ...formData, visitorName: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Visitor's Title *</label>
                        <input type="text" className="input-field" required value={formData.visitorTitle} onChange={e => setFormData({ ...formData, visitorTitle: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Current Company Name *</label>
                        <input type="text" className="input-field" required value={formData.currentCompany} onChange={e => setFormData({ ...formData, currentCompany: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Purpose of Visit *</label>
                        <select className="input-field" value={formData.purposeOfVisit} onChange={e => setFormData({ ...formData, purposeOfVisit: e.target.value })}>
                            <option>Business / Meeting</option>
                            <option>Installation & Maintenance</option>
                            <option>Technical / Project Support</option>
                            <option>Audit / Inspection</option>
                            <option>Training / Knowledge Sharing</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Visitor Category *</label>
                        <select className="input-field" value={formData.visitorCategory} onChange={e => setFormData({ ...formData, visitorCategory: e.target.value })}>
                            <option>Vendor</option>
                            <option>MIL/TTI Expat / SHTP Business trip</option>
                            <option>Contractor</option>
                            <option>Interviewee</option>
                        </select>
                    </div>
                    <div className="form-group-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Start Date *</label>
                            <input type="date" className="input-field" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>End Date *</label>
                            <input type="date" className="input-field" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                    </div>
                </div>

                {isExpatCategory && (
                    <div style={{ marginTop: '3rem', animation: 'fadeIn 0.5s ease' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Area Access (Workflow-based)</h2>

                        {Object.entries(groupedRooms).map(([category, items]: any) => (
                            <div key={category} style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {items.map((room: any) => (
                                        <label key={room.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            background: formData.roomIds.includes(room.id) ? '#db011c' : '#f8fafc',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            color: formData.roomIds.includes(room.id) ? 'white' : 'var(--text-main)',
                                            border: formData.roomIds.includes(room.id) ? '1px solid #db011c' : '1px solid var(--border)',
                                            transition: 'all 0.2s',
                                            boxShadow: formData.roomIds.includes(room.id) ? '0 4px 12px rgba(219, 1, 28, 0.2)' : 'none'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.roomIds.includes(room.id)}
                                                onChange={() => toggleRoom(room.id)}
                                                style={{ accentColor: 'white', width: '18px', height: '18px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{room.name}</span>
                                                {room.approver_email && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Approver: {room.approver_email}</span>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <h2 style={{ fontSize: '1.25rem', marginTop: '3rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Other Requirements</h2>

                <div className="form-group">
                    <label>Do you want to make a factory tour?</label>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="radio" checked={formData.details.factoryTour === 'Yes'} onChange={() => updateDetails('factoryTour', 'Yes')} /> Yes</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="radio" checked={formData.details.factoryTour === 'No'} onChange={() => updateDetails('factoryTour', 'No')} /> No</label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Meal Registration (For Canteen Use) *</label>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="radio" checked={formData.details.mealRegistration === 'Yes'} onChange={() => updateDetails('mealRegistration', 'Yes')} /> Yes</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="radio" checked={formData.details.mealRegistration === 'No'} onChange={() => updateDetails('mealRegistration', 'No')} /> No</label>
                    </div>
                </div>

                {formData.details.mealRegistration === 'Yes' && (
                    <div className="form-group" style={{ maxWidth: '300px' }}>
                        <label>Charged Cost Center *</label>
                        <input type="text" className="input-field" value={formData.details.costCenter} onChange={e => updateDetails('costCenter', e.target.value)} placeholder="000-00-0000" />
                    </div>
                )}

                <button type="submit" className="btn" style={{
                    marginTop: '2.5rem',
                    padding: '1.25rem 3rem',
                    fontSize: '1.125rem',
                    background: '#db011c',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(219, 1, 28, 0.3)'
                }} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request for Approval'}
                </button>
            </form>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
