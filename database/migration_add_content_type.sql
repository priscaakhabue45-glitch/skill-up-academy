-- Add content_type to lectures table
ALTER TABLE lectures 
ADD COLUMN content_type TEXT NOT NULL DEFAULT 'video'; -- 'video', 'supporting_video', 'assignment', 'pdf'

-- Update existing rows if any (optional, but good practice)
UPDATE lectures SET content_type = 'video' WHERE content_type IS NULL;
