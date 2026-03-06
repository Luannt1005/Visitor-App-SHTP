const { Client } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres.oxdihgyistbnwcmeadpj:Luannt_10052@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const sql = `
-- 1. Thêm 2 cột chứa tên vào bảng để Webhook có thể lấy được
ALTER TABLE request_approvals ADD COLUMN IF NOT EXISTS visitor_name TEXT;
ALTER TABLE request_approvals ADD COLUMN IF NOT EXISTS room_name TEXT;

-- 2. Hàm tự động lấy tên từ bảng khác điền vào 2 cột này
CREATE OR REPLACE FUNCTION fill_approval_names()
RETURNS TRIGGER AS $$
BEGIN
    SELECT visitor_name INTO NEW.visitor_name FROM visitor_requests WHERE id = NEW.request_id;
    SELECT name INTO NEW.room_name FROM room_areas WHERE id = NEW.room_area_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tạo Trigger để tự động chạy hàm trên khi có dòng mới
DROP TRIGGER IF EXISTS trg_fill_approval_names ON request_approvals;
CREATE TRIGGER trg_fill_approval_names
BEFORE INSERT ON request_approvals
FOR EACH ROW EXECUTE FUNCTION fill_approval_names();
`;

async function setup() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Supabase!');
        await client.query(sql);
        console.log('Database updated: Columns visitor_name and room_name added with automation trigger.');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await client.end();
    }
}

setup();
