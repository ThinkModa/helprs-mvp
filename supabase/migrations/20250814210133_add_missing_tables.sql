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

-- Create indexes for performance
CREATE INDEX idx_notifications_worker_id ON notifications(worker_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_from_worker_id ON messages(from_worker_id);
CREATE INDEX idx_messages_to_worker_id ON messages(to_worker_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable RLS on new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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
