-- ########################################################
-- MASTI PATHSHALA - PROFESSIONAL DATABASE SCHEMA
-- ########################################################

-- Create Database
CREATE DATABASE IF NOT EXISTS masti_pathsala;
USE masti_pathsala;

-- 1. Users Table
-- Stores core authentication and account information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. User Avatars Table
-- Stores the visual customization settings for each user's character
CREATE TABLE IF NOT EXISTS user_avatars (
    user_id INT PRIMARY KEY,
    skinColor VARCHAR(20),
    hairColor VARCHAR(20),
    hairStyle VARCHAR(20),
    eyeColor VARCHAR(20),
    eyeStyle VARCHAR(20),
    mouthStyle VARCHAR(20),
    topStyle VARCHAR(20),
    topColor VARCHAR(20),
    bottomStyle VARCHAR(20),
    bottomColor VARCHAR(20),
    shoesStyle VARCHAR(20),
    shoesColor VARCHAR(20),
    accessory VARCHAR(20),
    companion VARCHAR(20),
    bgColor VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Learning Modules Table
-- Defines the different educational categories available
CREATE TABLE IF NOT EXISTS learning_modules (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category ENUM('learning', 'game', 'creative') DEFAULT 'learning'
);

-- 4. Module Content Table
-- Stores the specific items within each module (e.g., Letter 'A', Number '1')
CREATE TABLE IF NOT EXISTS module_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id VARCHAR(50),
    content_key VARCHAR(50), -- e.g., 'A', '1', 'Lion'
    title VARCHAR(100),
    image_url VARCHAR(255),
    audio_url VARCHAR(255),
    extra_data JSON, -- For emojis, hints, or additional facts
    FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);

-- 5. User Progress Table
-- Tracks overall module completion and high scores
CREATE TABLE IF NOT EXISTS user_progress (
    user_id INT,
    module_id VARCHAR(50),
    completed BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    times_played INT DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, module_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);

-- 6. User Detailed Progress
-- Tracks specific items learned within a module
CREATE TABLE IF NOT EXISTS user_detailed_progress (
    user_id INT,
    module_id VARCHAR(50),
    content_id INT,
    mastered BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    PRIMARY KEY (user_id, content_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES module_content(id) ON DELETE CASCADE
);

-- 7. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id VARCHAR(50),
    question_text TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    wrong_answers JSON,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);

-- 8. Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    requirement_type ENUM('score', 'games_count', 'total_points') NOT NULL,
    requirement_value INT NOT NULL
);

-- 9. User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    user_id INT,
    badge_id VARCHAR(50),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- 10. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    student_id INT,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    submission_text TEXT,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'magical',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
SELECT * FROM users;
-- ########################################################
-- INITIAL DATA SEEDING (Example Data)
-- ########################################################

-- ... (existing modules)

-- Insert professional badges
INSERT IGNORE INTO badges (id, title, description, requirement_type, requirement_value) VALUES
('first_win', 'First Step!', 'Completed your first learning module', 'games_count', 1),
('score_100', 'Centurion', 'Reached a score of 100 in any game', 'score', 100),
('math_master', 'Math Whiz', 'Completed the Math module', 'score', 1),
('alphabet_hero', 'A-Z Explorer', 'Mastered all alphabets', 'score', 1),
('top_learner', 'Top 10 Star', 'Reached the global leaderboard', 'total_points', 500);

-- Insert basic modules
INSERT IGNORE INTO learning_modules (id, title, description, icon, category) VALUES
('alphabets', 'Alphabets', 'Learn A-Z with fun pictures!', 'abc', 'learning'),
('numbers', 'Numbers', 'Counting from 1 to 100', '123', 'learning'),
('animals', 'Animals', 'Meet your furry and wild friends', 'lion', 'learning'),
('space', 'Space Explorer', 'A galactic alphabet game', 'rocket', 'game'),
('num', 'Number Swim', 'Dive for numbers in the ocean', 'fish', 'game');

-- Insert some example alphabet content
INSERT IGNORE INTO module_content (module_id, content_key, title, extra_data) VALUES
('alphabets', 'A', 'Apple', '{"emoji": "🍎", "fact": "Apples are crunchy!"}'),
('alphabets', 'B', 'Ball', '{"emoji": "⚽", "fact": "Bouncing balls is fun!"}'),
('numbers', '1', 'One', '{"emoji": "1️⃣", "fact": "The first number!"}');

-- ########################################################
-- END OF SCHEMA
-- ########################################################
