-- Fix YouTube video URLs in Module 1
-- Run this in Supabase SQL Editor to update the videos with working YouTube links

-- Update videos with proper embeddable YouTube URLs
UPDATE lectures 
SET video_url = 'https://www.youtube.com/embed/75d_29QWELk'
WHERE title = 'Introduction to Growth Mindset' 
AND content_type = 'video';

UPDATE lectures 
SET video_url = 'https://www.youtube.com/embed/KUWn_TJTrnU'
WHERE title = 'Overcoming Limiting Beliefs' 
AND content_type = 'video';

UPDATE lectures 
SET video_url = 'https://www.youtube.com/embed/_X0mgOOSpLU'
WHERE title = 'TED Talk: The Power of Belief' 
AND content_type = 'supporting_video';

-- If you have a "Doing before becoming" video, update it here
-- Replace 'VIDEO_ID_HERE' with the actual YouTube video ID
UPDATE lectures 
SET video_url = 'https://www.youtube.com/embed/VIDEO_ID_HERE'
WHERE title ILIKE '%doing before becoming%';

-- To check all current videos in module 1:
-- SELECT title, video_url, content_type FROM lectures WHERE module_id IN (SELECT id FROM modules WHERE week_number = 1);
