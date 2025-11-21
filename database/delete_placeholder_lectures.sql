-- Delete the placeholder lectures from Module 1
-- Run this in your Supabase SQL Editor

DELETE FROM lectures 
WHERE title IN (
    'Introduction to Growth Mindset',
    'Overcoming Limiting Beliefs',
    'TED Talk: The Power of Belief'
)
AND module_id IN (SELECT id FROM modules WHERE week_number = 1);

-- Verify what's left in Module 1
SELECT title, content_type, order_index 
FROM lectures 
WHERE module_id IN (SELECT id FROM modules WHERE week_number = 1)
ORDER BY order_index;
