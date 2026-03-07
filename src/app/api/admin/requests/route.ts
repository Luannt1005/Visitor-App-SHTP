import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifyAuth(token);

        if (session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: requests, error } = await supabase
            .from('visitor_requests')
            .select(`
        *,
        profiles (
          name,
          department
        ),
        request_approvals (
          id,
          status,
          approver_email,
          room_areas (
            name,
            category
          )
        )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ requests }, { status: 200 });
    } catch (error) {
        console.error('Fetch requests error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Update status
export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifyAuth(token);
        if (session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, type, ...updates } = body;

        if (type === 'ROOM_APPROVAL') {
            const { approvalId, status } = updates;
            const { data: updatedApproval, error: roomError } = await supabase
                .from('request_approvals')
                .update({ status })
                .eq('id', approvalId)
                .select('request_id')
                .single();

            if (roomError) return NextResponse.json({ error: roomError.message }, { status: 500 });

            // Sync overall status after manual admin room update
            const { data: allApps } = await supabase
                .from('request_approvals')
                .select('status')
                .eq('request_id', updatedApproval.request_id);

            if (allApps) {
                const anyRejected = allApps.some(a => a.status === 'REJECTED');
                const allDone = allApps.every(a => a.status === 'APPROVED' || a.status === 'REJECTED');
                let finalStatus = 'IN PROCESS';
                if (anyRejected) finalStatus = 'REJECTED';
                else if (allDone) finalStatus = 'COMPLETE';

                await supabase.from('visitor_requests').update({ status: finalStatus }).eq('id', updatedApproval.request_id);
            }
            return NextResponse.json({ message: 'Room status updated' });
        }

        const { data, error } = await supabase
            .from('visitor_requests')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Request updated successfully', data }, { status: 200 });
    } catch (err) {
        console.error('Update status error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
