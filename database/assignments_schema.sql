-- Create Assignment Status ENUM
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded');

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions table
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    status assignment_status DEFAULT 'submitted',
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Create indexes
CREATE INDEX idx_assignments_module ON assignments(module_id);
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);

-- Triggers for updated_at
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON assignment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments Policies
CREATE POLICY "Everyone can view assignments" ON assignments
    FOR SELECT USING (true);

CREATE POLICY "Instructors can manage assignments" ON assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );

-- Submissions Policies
CREATE POLICY "Students can view their own submissions" ON assignment_submissions
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create submissions" ON assignment_submissions
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own submissions" ON assignment_submissions
    FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Instructors can view all submissions" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );

CREATE POLICY "Instructors can grade submissions" ON assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );
