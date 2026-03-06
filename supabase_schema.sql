-- Create a table for dynamic room areas
CREATE TABLE room_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  approver_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a table for users (profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Storing hashed password since we are using custom auth
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER' NOT NULL, -- ADMIN, USER
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Visitor Requests table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Request Approvals for multi-stage workflow
CREATE TABLE request_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES visitor_requests(id) ON DELETE CASCADE,
  room_area_id UUID REFERENCES room_areas(id),
  status TEXT DEFAULT 'PENDING' NOT NULL,
  approver_email TEXT,
  acted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(request_id, room_area_id)
);

-- Insert initial room areas
INSERT INTO room_areas (category, name) VALUES
  ('Common Office', 'Share Function Office L6M'),
  ('Common Office', 'MIL Office L6M'),
  ('Common Office', 'Share Function Office L4M'),
  ('Common Office', 'MIL Office L4M'),
  ('AME', 'AME Office L4M'),
  ('AME', 'AME Workshop L5F'),
  ('ENG', 'ENG Office L2M'),
  ('ENG', 'ENG Office L4M'),
  ('ENG', 'Test Lab Entrance'),
  ('EE/MT', 'EE/MT ENG Areas L2M'),
  ('MFG', 'Level 3: Production Office L3F - PM Workshop L3F'),
  ('MFG', 'Level 5: Production Office L5F - PM Workshop L5F'),
  ('Shipping', 'Shipping Office L1'),
  ('Quality QM', 'QM Office L6M'),
  ('Quality QM', 'MET/IQC Office L1M');
