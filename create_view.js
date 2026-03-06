const { Client } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres.oxdihgyistbnwcmeadpj:Luannt_10052@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const sql = `
CREATE OR REPLACE VIEW power_automate_approvals AS
SELECT 
    ra.id,
    ra.status,
    ra.approver_email,
    vr.visitor_name,
    vr.current_company,
    rm.name as room_name,
    rm.category as room_category
FROM request_approvals ra
JOIN visitor_requests vr ON ra.request_id = vr.id
JOIN room_areas rm ON ra.room_area_id = rm.id;
`;

async function setup() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Supabase!');
        await client.query(sql);
        console.log('View "power_automate_approvals" created successfully!');
    } catch (err) {
        console.error('Error creating view:', err);
    } finally {
        await client.end();
    }
}

setup();
