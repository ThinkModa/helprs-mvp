-- Add missing tables for worker mobile app functionality

-- Notifications table for job alerts, chat notifications, etc.
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT 'notification_' || substr(md5(random()::text), 1, 8),
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('job_assigned', 'job_reminder', 'chat_message', 'payment_received', 'job_cancelled', 'schedule_change')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    related_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table for worker-to-worker chat
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT 'message_' || substr(md5(random()::text), 1, 8),
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    from_worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    to_worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Worker availability table (if not already exists)
CREATE TABLE IF NOT EXISTS worker_availability (
    id TEXT PRIMARY KEY DEFAULT 'availability_' || substr(md5(random()::text), 1, 8),
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(worker_id, date)
);

-- Availability time blocks table (if not already exists)
CREATE TABLE IF NOT EXISTS availability_time_blocks (
    id TEXT PRIMARY KEY DEFAULT 'time_block_' || substr(md5(random()::text), 1, 8),
    worker_availability_id TEXT REFERENCES worker_availability(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_worker_id ON notifications(worker_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_from_worker_id ON messages(from_worker_id);
CREATE INDEX idx_messages_to_worker_id ON messages(to_worker_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_worker_availability_worker_id ON worker_availability(worker_id);
CREATE INDEX idx_worker_availability_date ON worker_availability(date);

-- Enable RLS on new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_time_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Workers can view their own notifications" ON notifications
    FOR SELECT USING (
        worker_id IN (
            SELECT w.id FROM workers w 
            JOIN users u ON w.user_id = u.id 
            WHERE u.id = auth.uid()::text
        )
    );

CREATE POLICY "Workers can update their own notifications" ON notifications
    FOR UPDATE USING (
        worker_id IN (
            SELECT w.id FROM workers w 
            JOIN users u ON w.user_id = u.id 
            WHERE u.id = auth.uid()::text
        )
    );

-- RLS Policies for messages
CREATE POLICY "Workers can view messages for their jobs" ON messages
    FOR SELECT USING (
        job_id IN (
            SELECT jw.job_id FROM job_workers jw 
            JOIN workers w ON jw.worker_id = w.id 
            JOIN users u ON w.user_id = u.id 
            WHERE u.id = auth.uid()::text
        )
    );

CREATE POLICY "Workers can insert messages for their jobs" ON messages
    FOR INSERT WITH CHECK (
        from_worker_id IN (
            SELECT w.id FROM workers w 
            JOIN users u ON w.user_id = u.id 
            WHERE u.id = auth.uid()::text
        )
    );

-- RLS Policies for worker availability
CREATE POLICY "Workers can manage their own availability" ON worker_availability
    FOR ALL USING (
        worker_id IN (
            SELECT w.id FROM workers w 
            JOIN users u ON w.user_id = u.id 
            WHERE u.id = auth.uid()::text
        )
    );

-- RLS Policies for availability time blocks
CREATE POLICY "Workers can manage their own time blocks" ON availability_time_blocks
    FOR ALL USING (
        worker_availability_id IN (
            SELECT wa.id FROM worker_availability wa
            JOIN workers w ON wa.worker_id = w.id 
            JOIN users u ON w.user_id = u.id 
            WHERE u.id = auth.uid()::text
        )
    );

-- Insert some test data for notifications
INSERT INTO notifications (worker_id, type, title, message, related_job_id) VALUES
('worker_12345678', 'job_assigned', 'New Job Assigned', 'You have been assigned to a new cleaning job at 123 Main St.', 'job_12345678'),
('worker_12345678', 'job_reminder', 'Job Reminder', 'Your job at 123 Main St. starts in 30 minutes.', 'job_12345678'),
('worker_12345678', 'payment_received', 'Payment Received', 'You received a payment of $45.00 for your recent job.', NULL);

-- Insert some test data for messages
INSERT INTO messages (job_id, from_worker_id, to_worker_id, message) VALUES
('job_12345678', 'worker_12345678', 'worker_87654321', 'Hey, I\'m running 10 minutes late. See you soon!'),
('job_12345678', 'worker_87654321', 'worker_12345678', 'No problem, I\'ll start setting up.'),
('job_12345678', 'worker_12345678', 'worker_87654321', 'Great, I\'m here now. Where should I start?');

-- Insert some test data for worker availability
INSERT INTO worker_availability (worker_id, date, is_available) VALUES
('worker_12345678', CURRENT_DATE, true),
('worker_12345678', CURRENT_DATE + INTERVAL '1 day', true),
('worker_12345678', CURRENT_DATE + INTERVAL '2 days', false);

-- Insert some test data for availability time blocks
INSERT INTO availability_time_blocks (worker_availability_id, start_time, end_time, is_available) VALUES
((SELECT id FROM worker_availability WHERE worker_id = 'worker_12345678' AND date = CURRENT_DATE LIMIT 1), '09:00', '12:00', true),
((SELECT id FROM worker_availability WHERE worker_id = 'worker_12345678' AND date = CURRENT_DATE LIMIT 1), '13:00', '17:00', true),
((SELECT id FROM worker_availability WHERE worker_id = 'worker_12345678' AND date = CURRENT_DATE + INTERVAL '1 day' LIMIT 1), '08:00', '16:00', true);

