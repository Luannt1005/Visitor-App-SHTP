import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { approval_id, status } = body;

        if (!approval_id || !status) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Update the specific approval record
        const { data: updatedApproval, error: updateError } = await supabase
            .from('request_approvals')
            .update({ status })
            .eq('id', approval_id)
            .select('request_id')
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 2. Check if ALL approvals for this request are now complete
        const requestId = updatedApproval.request_id;
        const { data: allApprovals } = await supabase
            .from('request_approvals')
            .select('status')
            .eq('request_id', requestId);

        if (allApprovals) {
            const allApproved = allApprovals.every(a => a.status === 'APPROVED');
            const anyRejected = allApprovals.some(a => a.status === 'REJECTED');

            let finalStatus = 'PENDING';
            if (anyRejected) finalStatus = 'REJECTED';
            else if (allApproved) finalStatus = 'APPROVED';

            if (finalStatus !== 'PENDING') {
                await supabase
                    .from('visitor_requests')
                    .update({ status: finalStatus })
                    .eq('id', requestId);
            }
        }

        return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
