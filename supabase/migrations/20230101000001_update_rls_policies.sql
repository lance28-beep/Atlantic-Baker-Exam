-- Drop existing policies for examiners table
DROP POLICY IF EXISTS "Examiners can view their own profile" ON examiners;
DROP POLICY IF EXISTS "Admins can view all examiner profiles" ON examiners;

-- Create updated policies for examiners table
CREATE POLICY "Examiners can view their own profile"
  ON examiners FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Examiners can update their own profile"
  ON examiners FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all examiner profiles"
  ON examiners FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can update all examiner profiles"
  ON examiners FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can insert examiner profiles"
  ON examiners FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Ensure the examiners table has RLS enabled
ALTER TABLE examiners ENABLE ROW LEVEL SECURITY;
