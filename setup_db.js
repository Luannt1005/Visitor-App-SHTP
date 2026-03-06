const { Client } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres.oxdihgyistbnwcmeadpj:Luannt_10052@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS request_approvals CASCADE;
DROP TABLE IF EXISTS visitor_requests CASCADE;
DROP TABLE IF EXISTS room_areas CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER' NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE room_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  approver_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE visitor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'PENDING' NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_title TEXT,
  current_company TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose_of_visit TEXT,
  visitor_category TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE request_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES visitor_requests(id) ON DELETE CASCADE,
  room_area_id UUID REFERENCES room_areas(id),
  status TEXT DEFAULT 'PENDING' NOT NULL,
  approver_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(request_id, room_area_id)
);

INSERT INTO room_areas (category, name) VALUES
  ('Common Office', 'Share Function Office L6M'),
  ('Common Office', 'MIL Office L6M'),
  ('AME', 'AME Office L4M'),
  ('AME', 'AME Workshop L5F'),
  ('ENG', 'ENG Office L2M'),
  ('ENG', 'ENG Office L4M'),
  ('ENG', 'Test Lab Entrance'),
  ('MFG', 'Production Office L3F'),
  ('Shipping', 'Shipping Office L1'),
  ('Quality', 'QM Office L6M');
`;

async function setup() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Supabase!');
        await client.query(sql);
        console.log('Schema created successfully!');
    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        await client.end();
    }
}

setup();
