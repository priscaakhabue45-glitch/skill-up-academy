-- Fix the "Doing before becoming" video
-- Run this in your Supabase SQL Editor

UPDATE lectures 
SET video_url = 'https://www.youtube.com/embed/etlhziyv8lA'
WHERE title ILIKE '%doing before becoming%';

-- Verify the update
SELECT title, video_url, content_type 
FROM lectures 
WHERE title ILIKE '%doing before becoming%';
