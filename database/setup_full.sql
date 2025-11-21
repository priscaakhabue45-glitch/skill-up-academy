-- ==========================================
-- SKILL UP ACADEMY - FULL DATABASE SETUP
-- ==========================================
-- Run this entire script in the Supabase SQL Editor to reset and set up your database.

-- 1. RESET (Drop all existing tables)
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS student_lecture_progress CASCADE;
DROP TABLE IF EXISTS student_module_progress CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop Types
DROP TYPE IF EXISTS module_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. SCHEMA SETUP

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

-- Lectures table (Updated with content_type)
CREATE TABLE lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    pdf_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'video', -- 'video', 'supporting_video', 'assignment', 'pdf'
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
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    options JSONB,
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
    answers JSONB NOT NULL,
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
    email_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent',
    error_message TEXT
);

-- 3. RLS POLICIES

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

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Modules
CREATE POLICY "Modules are viewable by everyone" ON modules FOR SELECT USING (true);
CREATE POLICY "Instructors can insert modules" ON modules FOR INSERT WITH CHECK (true); -- Simplified for dev
CREATE POLICY "Instructors can update modules" ON modules FOR UPDATE USING (true);
CREATE POLICY "Instructors can delete modules" ON modules FOR DELETE USING (true);

-- Lectures (Simplified for immediate access)
CREATE POLICY "Lectures are viewable by everyone" ON lectures FOR SELECT USING (true);
CREATE POLICY "Instructors can insert lectures" ON lectures FOR INSERT WITH CHECK (true);
CREATE POLICY "Instructors can update lectures" ON lectures FOR UPDATE USING (true);
CREATE POLICY "Instructors can delete lectures" ON lectures FOR DELETE USING (true);

-- 4. SEED DATA

DO $$
DECLARE
    module1_id UUID;
BEGIN
    -- Insert Module 1
    INSERT INTO modules (title, description, week_number, unlock_date, content_order, is_published)
    VALUES (
        'Mindset Reengineering', 
        'Personal Vision Statement', 
        1, 
        NOW(), 
        1, 
        true
    )
    RETURNING id INTO module1_id;

    -- Insert Lessons for Module 1
    INSERT INTO lectures (module_id, title, description, video_url, duration_minutes, order_index, content_type)
    VALUES 
        (module1_id, 'Introduction to Growth Mindset', 'Understanding the basics of growth mindset.', 'https://www.youtube.com/embed/M523S3kap9s', 15, 1, 'video'),
        (module1_id, 'Overcoming Limiting Beliefs', 'How to identify and crush limiting beliefs.', 'https://www.youtube.com/embed/M523S3kap9s', 20, 2, 'video'),
        (module1_id, 'TED Talk: The Power of Belief', 'Supplementary viewing on mindset.', 'https://www.youtube.com/embed/M523S3kap9s', 10, 3, 'supporting_video'),
        (module1_id, 'Assignment: Personal Vision Statement', 'Draft your personal vision statement using the template provided. Focus on your 5-year goals.', NULL, 45, 4, 'assignment');

    -- Create Placeholder Modules 2-14
    FOR i IN 2..14 LOOP
        INSERT INTO modules (title, description, week_number, unlock_date, content_order, is_published)
        VALUES (
            'Week ' || i || ': Upcoming Module', 
            'Content coming soon...', 
            i, 
            NOW() + (i - 1) * INTERVAL '1 week', 
            i, 
            true 
        );
    END LOOP;
END $$;
