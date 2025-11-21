-- Insert Module 1
DO $$
DECLARE
    module1_id UUID;
BEGIN
    -- Create Module 1
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

    -- Add Lectures for Module 1
    INSERT INTO lectures (module_id, title, description, video_url, duration_minutes, order_index)
    VALUES 
        (module1_id, 'Video 1: Introduction to Growth Mindset', 'Understanding the basics of growth mindset.', 'https://www.youtube.com/embed/M523S3kap9s', 15, 1),
        (module1_id, 'Video 2: Overcoming Limiting Beliefs', 'How to identify and crush limiting beliefs.', 'https://www.youtube.com/embed/M523S3kap9s', 20, 2),
        (module1_id, 'Video 3: Crafting Your Vision', 'Steps to create a compelling personal vision.', 'https://www.youtube.com/embed/M523S3kap9s', 18, 3);

    -- Add Resource (as a lecture with no video for now, or we can add a resources table later)
    -- For now, we'll just add it as a "text" lecture or similar if needed, but the UI expects resources in a specific way.
    -- The current schema has a 'lectures' table. Let's add the PDF resource as a lecture for now or handle it in the UI.
    
    -- Create Placeholder Modules 2-14
    FOR i IN 2..14 LOOP
        INSERT INTO modules (title, description, week_number, unlock_date, content_order, is_published)
        VALUES (
            'Week ' || i || ' Module', 
            'Content coming soon...', 
            i, 
            NOW() + (i - 1) * INTERVAL '1 week', 
            i, 
            true -- Published but future unlock date handles "locking" logic if implemented, or we can set is_published false
        );
    END LOOP;
END $$;
