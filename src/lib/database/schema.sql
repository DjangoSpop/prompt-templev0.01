-- PromptCraft Database Schema
-- This is a reference schema for your backend database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    bio TEXT,
    website VARCHAR(200),
    location VARCHAR(100),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_staff BOOLEAN DEFAULT false,
    is_superuser BOOLEAN DEFAULT false,
    date_joined TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    
    -- Gamification fields
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Template categories
CREATE TABLE template_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    category_id INTEGER REFERENCES template_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Visibility and status
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Ratings
    rating_sum INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Metadata
    tags TEXT[], -- Array of tag names
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_time_minutes INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Template variables (dynamic form fields)
CREATE TABLE template_variables (
    id SERIAL PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'textarea', 'number', 'select', 'checkbox', 'date', 'email', 'url')),
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_rules JSONB, -- JSON object with validation rules
    options JSONB, -- For select types, array of options
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Template ratings and reviews
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(template_id, user_id) -- One rating per user per template
);

-- Template usage sessions (for analytics)
CREATE TABLE template_usage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_data JSONB, -- Variables used, output generated, etc.
    success BOOLEAN,
    error_message TEXT,
    completion_time INTEGER, -- in milliseconds
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Template tags (many-to-many)
CREATE TABLE template_tags (
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- User favorites
CREATE TABLE user_template_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, template_id)
);

-- User template history
CREATE TABLE user_template_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    variables_used JSONB,
    output_generated TEXT,
    execution_time INTEGER, -- in milliseconds
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    properties JSONB,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Gamification: Achievements
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    points INTEGER DEFAULT 0,
    requirement_type VARCHAR(50) NOT NULL, -- 'usage_count', 'streak', 'ratings', etc.
    requirement_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, achievement_id)
);

-- Badges
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7), -- Hex color
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User badges
CREATE TABLE user_badges (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    action_text VARCHAR(100),
    data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_author ON templates(author_id);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_featured ON templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_rating ON templates(avg_rating DESC);
CREATE INDEX idx_templates_usage ON templates(usage_count DESC);
CREATE INDEX idx_templates_created ON templates(created_at DESC);
CREATE INDEX idx_templates_updated ON templates(updated_at DESC);

CREATE INDEX idx_template_ratings_template ON template_ratings(template_id);
CREATE INDEX idx_template_ratings_user ON template_ratings(user_id);

CREATE INDEX idx_template_usage_sessions_template ON template_usage_sessions(template_id);
CREATE INDEX idx_template_usage_sessions_user ON template_usage_sessions(user_id);
CREATE INDEX idx_template_usage_sessions_created ON template_usage_sessions(created_at DESC);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Full-text search indexes
CREATE INDEX idx_templates_search ON templates USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
CREATE INDEX idx_templates_tags ON templates USING gin(tags);

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_template_categories_updated_at BEFORE UPDATE ON template_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_template_variables_updated_at BEFORE UPDATE ON template_variables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_template_ratings_updated_at BEFORE UPDATE ON template_ratings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Sample data
INSERT INTO template_categories (name, slug, description, icon, color) VALUES
('Business', 'business', 'Business-related prompts for strategy, planning, and operations', 'briefcase', '#2563eb'),
('Creative Writing', 'creative-writing', 'Prompts for creative content, stories, and copywriting', 'pen-tool', '#7c3aed'),
('Technical', 'technical', 'Programming, development, and technical documentation prompts', 'code', '#059669'),
('Marketing', 'marketing', 'Marketing copy, campaigns, and promotional content', 'megaphone', '#dc2626'),
('Education', 'education', 'Learning materials, explanations, and educational content', 'book-open', '#ea580c'),
('Data Analysis', 'data-analysis', 'Data insights, reporting, and analytical prompts', 'bar-chart', '#0891b2');

INSERT INTO tags (name, slug, description) VALUES
('beginner', 'beginner', 'Suitable for beginners'),
('intermediate', 'intermediate', 'Requires some experience'),
('advanced', 'advanced', 'For experienced users'),
('quick', 'quick', 'Takes less than 5 minutes'),
('detailed', 'detailed', 'Comprehensive and thorough'),
('creative', 'creative', 'Encourages creativity'),
('analytical', 'analytical', 'Data-driven and analytical'),
('strategic', 'strategic', 'Strategic thinking required');