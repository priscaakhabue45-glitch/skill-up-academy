-- Enable RLS on daily_logs if not already enabled
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own logs
CREATE POLICY "Users can select own daily logs" ON daily_logs
    FOR SELECT
    USING (auth.uid() = student_id);

-- Policy to allow users to insert their own logs
CREATE POLICY "Users can insert own daily logs" ON daily_logs
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Policy to allow users to update their own logs
CREATE POLICY "Users can update own daily logs" ON daily_logs
    FOR UPDATE
    USING (auth.uid() = student_id);
