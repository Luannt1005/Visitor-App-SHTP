import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Support both 'approval_id' (our legacy) and 'id' (from Supabase record)
        const approvalId = (body.approval_id || body.id || "").toString().trim();
        const status = (body.status || "").toString().trim();

        if (!approvalId || !status) {
            console.error('Missing parameters in webhook:', body);
            return NextResponse.json({
                error: 'Missing parameters',
                received: { approvalId, status },
                body_received: body
            }, { status: 400 });
        }

        // 1. Update the specific approval record
        const { data: updatedApproval, error: updateError } = await supabase
            .from('request_approvals')
            .update({ status })
            .eq('id', approvalId)
            .select('request_id')
            .single();

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 2. Check if ALL approvals for this request are now complete
        const requestId = updatedApproval.request_id;
        const { data: allApprovals } = await supabase
            .from('request_approvals')
            .select('status')
            .eq('request_id', requestId);

        if (allApprovals) {
            const allProcessed = allApprovals.every(a => a.status === 'APPROVED' || a.status === 'REJECTED');
            const anyRejected = allApprovals.some(a => a.status === 'REJECTED');

            let finalStatus = 'IN PROCESS';
            if (anyRejected) {
                finalStatus = 'REJECTED';
            } else if (allProcessed) {
                finalStatus = 'COMPLETE';
            }

            if (finalStatus !== 'IN PROCESS') {
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
