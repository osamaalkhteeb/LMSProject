-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    role VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')),
    oauth_provider VARCHAR(20) UNIQUE,
    oauth_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE ,
    last_login_at TIMESTAMP WITH TIME ZONE,
    bio TEXT,
    avatar_url TEXT,
    image_public_id TEXT
);

-- COURSES
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    thumbnail_url TEXT,
    image_public_id TEXT,
	is_featured BOOLEAN DEFAULT false,
	is_published BOOLEAN DEFAULT false,
	is_approved BOOLEAN DEFAULT false;
);

-- CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- ENROLLMENTS
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100)
);

-- MODULES
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(150),
    description TEXT,
    order_num INTEGER
);

-- LESSONS
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id),
    title VARCHAR(150),
    content_type VARCHAR(20) CHECK (content_type IN ('video', 'quiz', 'text', 'assignment')),
    content_url TEXT,
    duration INTEGER,
    order_num INTEGER
);

-- ASSIGNMENTS
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER UNIQUE REFERENCES lessons(id),
    title VARCHAR(150),
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE
);

-- SUBMISSIONS
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    submission_url TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, user_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lesson_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, lesson_id) -- one completion per lesson per user
);

-- Quizzes (revised)
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id),
    title VARCHAR(150),
    passing_score INTEGER DEFAULT 50,
    time_limit INTEGER, -- in minutes, NULL means no time limit
    max_attempts INTEGER DEFAULT 1
);

-- QUIZ_QUESTIONS
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    points INTEGER DEFAULT 1,
    order_num INTEGER
);

-- QUIZ_OPTIONS (for multiple choice questions)
CREATE TABLE quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_num INTEGER
);

-- QUIZ_RESULTS (revised)
CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, quiz_id, attempt_number) -- Allow multiple attempts per quiz
);

-- QUIZ_ANSWERS
CREATE TABLE quiz_answers (
    id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES quiz_results(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT, -- For short answers
    option_id INTEGER REFERENCES quiz_options(id) ON DELETE SET NULL, -- For multiple choice
    is_correct BOOLEAN -- For quick reference
);


CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT
);

CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    badge_id INTEGER REFERENCES badges(id),
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, badge_id) -- Prevent duplicates
);

CREATE TABLE video_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    timestamp INTEGER CHECK (timestamp >= 0), -- in seconds
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    certificate_url TEXT NOT NULL,
    verification_code VARCHAR(20) UNIQUE
);

-- Course reviews
CREATE TABLE course_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)  -- Prevent duplicate reviews
);

-- Instructor dashboard view
CREATE VIEW instructor_analytics AS
SELECT 
    u.id AS instructor_id,
    COUNT(c.id) AS total_courses,
    AVG(cr.rating) AS avg_rating,
    COUNT(DISTINCT e.user_id) AS total_students
FROM users u
LEFT JOIN courses c ON u.id = c.instructor_id
LEFT JOIN course_reviews cr ON c.id = cr.course_id
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE u.role = 'instructor'
GROUP BY u.id;

-- Certificate verification view
CREATE VIEW certificate_verification AS
SELECT 
    c.id AS certificate_id,
    u.name AS student_name,
    co.title AS course_title,
    c.verification_code
FROM certificates c
JOIN users u ON c.user_id = u.id
JOIN courses co ON c.course_id = co.id;

-- Data fixes and updates
-- Update any NULL points in quiz_questions to default value of 1
UPDATE quiz_questions SET points = 1 WHERE points IS NULL;