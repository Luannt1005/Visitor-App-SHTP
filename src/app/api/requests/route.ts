import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifyAuth(token);
        const body = await request.json();

        const {
            visitorName,
            visitorTitle,
            currentCompany,
            startDate,
            endDate,
            purposeOfVisit,
            visitorCategory,
            details,
            roomIds, // Array of room UUIDs selected on frontend
        } = body;

        // 1. Create the main visitor request
        const { data: visitorRequest, error: requestError } = await supabase
            .from('visitor_requests')
            .insert({
                submitter_id: session.id,
                visitor_name: visitorName,
                visitor_title: visitorTitle,
                current_company: currentCompany,
                start_date: new Date(startDate),
                end_date: new Date(endDate),
                purpose_of_visit: purposeOfVisit,
                visitor_category: visitorCategory,
                details, // JSON data
                status: 'PENDING',
            })
            .select('id')
            .single();

        if (requestError) {
            console.error('Supabase request error:', requestError);
            return NextResponse.json({ error: requestError.message }, { status: 500 });
        }

        // 2. If roomIds were provided, create approval records for each room
        if (roomIds && roomIds.length > 0) {
            // Fetch selected rooms to get approver_email
            const { data: rooms } = await supabase
                .from('room_areas')
                .select('id, approver_email')
                .in('id', roomIds);

            if (rooms) {
                const approvals = rooms.map(room => ({
                    request_id: visitorRequest.id,
                    room_area_id: room.id,
                    approver_email: room.approver_email,
                    status: 'PENDING'
                }));

                const { error: approvalError } = await supabase
                    .from('request_approvals')
                    .insert(approvals);

                if (approvalError) {
                    console.error('Approval creation error:', approvalError);
                }
            }
        }

        return NextResponse.json({
            message: 'Request created successfully',
            visitorRequest
        }, { status: 201 });

    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifyAuth(token);

        const { data: requests, error } = await supabase
            .from('visitor_requests')
            .select(`
        *,
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
            .eq('submitter_id', session.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ requests }, { status: 200 });
    } catch (err) {
        console.error('Fetch requests error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
