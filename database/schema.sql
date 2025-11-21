-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin', 'superadmin');
CREATE TYPE module_status AS ENUM ('locked', 'unlocked', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    avatar_url TEXT
);

-- Modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    week_number INTEGER NOT NULL UNIQUE CHECK (week_number >= 1 AND week_number <= 14),
    unlock_date TIMESTAMPTZ NOT NULL,
    content_order INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lectures table
CREATE TABLE lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT, -- Google Drive file ID
    pdf_url TEXT, -- Google Drive file ID
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
    options JSONB, -- Array of options for multiple choice
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student progress for modules
CREATE TABLE student_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    status module_status DEFAULT 'locked',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, module_id)
);

-- Student progress for lectures
CREATE TABLE student_lecture_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lecture_id)
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL, -- Store student answers
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily accountability logs
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    videos_completed INTEGER DEFAULT 0,
    notes TEXT,
    key_learning TEXT,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, log_date)
);

-- Email notifications log
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL, -- 'weekly_module', 'inactivity_3day', 'inactivity_1week'
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent', -- 'sent', 'failed'
    error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_modules_week ON modules(week_number);
CREATE INDEX idx_modules_unlock_date ON modules(unlock_date);
CREATE INDEX idx_lectures_module ON lectures(module_id);
CREATE INDEX idx_quizzes_module ON quizzes(module_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_student_module_progress_student ON student_module_progress(student_id);
CREATE INDEX idx_student_module_progress_module ON student_module_progress(module_id);
CREATE INDEX idx_student_lecture_progress_student ON student_lecture_progress(student_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_daily_logs_student ON daily_logs(student_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lectures_updated_at BEFORE UPDATE ON lectures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Modules policies
CREATE POLICY "Everyone can view published modules" ON modules
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage modules" ON modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );

-- Lectures policies
CREATE POLICY "Students can view lectures in unlocked modules" ON lectures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_module_progress smp
            JOIN modules m ON smp.module_id = m.id
            WHERE smp.student_id = auth.uid() 
            AND smp.status IN ('unlocked', 'completed')
            AND lectures.module_id = m.id
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );

CREATE POLICY "Admins can manage lectures" ON lectures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );

-- Student progress policies
CREATE POLICY "Students can view their own progress" ON student_module_progress
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own progress" ON student_module_progress
    FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "System can insert progress" ON student_module_progress
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Lecture progress policies
CREATE POLICY "Students can view their lecture progress" ON student_lecture_progress
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can manage their lecture progress" ON student_lecture_progress
    FOR ALL USING (student_id = auth.uid());

-- Quiz attempts policies
CREATE POLICY "Students can view their quiz attempts" ON quiz_attempts
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view all attempts" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'superadmin')
        )
    );

-- Daily logs policies
CREATE POLICY "Students can manage their daily logs" ON daily_logs
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Instructors can view daily logs" ON daily_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'superadmin')
        )
    );

-- Quiz questions policies (students shouldn't see correct answers before taking quiz)
CREATE POLICY "Students can view quiz questions" ON quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage quiz questions" ON quiz_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'instructor')
        )
    );

-- Function to automatically unlock modules on Mondays at 9:00 AM WAT
-- This would be called by the backend cron job
CREATE OR REPLACE FUNCTION unlock_weekly_modules()
RETURNS void AS $$
BEGIN
    -- Unlock modules whose unlock_date has passed
    INSERT INTO student_module_progress (student_id, module_id, status, started_at)
    SELECT p.id, m.id, 'unlocked'::module_status, NOW()
    FROM profiles p
    CROSS JOIN modules m
    WHERE p.role = 'student'
    AND m.unlock_date <= NOW()
    AND m.is_published = true
    AND NOT EXISTS (
        SELECT 1 FROM student_module_progress smp
        WHERE smp.student_id = p.id AND smp.module_id = m.id
    )
    ON CONFLICT (student_id, module_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
