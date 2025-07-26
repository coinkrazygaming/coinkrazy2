-- Mini Games Database Schema

-- Table for tracking user game sessions and cooldowns
CREATE TABLE IF NOT EXISTS mini_game_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    last_played DATETIME DEFAULT NULL,
    next_available DATETIME DEFAULT NULL,
    total_plays INT DEFAULT 0,
    best_score INT DEFAULT 0,
    total_sc_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_game (user_id, game_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_next_available (next_available),
    INDEX idx_game_id (game_id)
);

-- Table for storing individual game results
CREATE TABLE IF NOT EXISTS mini_game_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    sc_earned DECIMAL(10,2) DEFAULT 0.00,
    gc_earned DECIMAL(10,2) DEFAULT 0.00,
    duration INT DEFAULT 60, -- seconds
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_game (user_id, game_id),
    INDEX idx_game_score (game_id, score DESC),
    INDEX idx_played_at (played_at)
);

-- Add SC and GC balance columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS sc_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS gc_balance DECIMAL(10,2) DEFAULT 0.00;

-- Update existing users to have starting balances
UPDATE users 
SET gc_balance = COALESCE(gc_balance, 0.00),
    sc_balance = COALESCE(sc_balance, 0.00)
WHERE gc_balance IS NULL OR sc_balance IS NULL;

-- Table for weekly leaderboard prizes tracking
CREATE TABLE IF NOT EXISTS mini_game_prizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    final_score INT NOT NULL,
    rank_position INT NOT NULL,
    prize_amount DECIMAL(10,2) NOT NULL,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_game_week (game_id, week_start),
    INDEX idx_user_prizes (user_id)
);

-- Insert sample mini game data for testing
INSERT IGNORE INTO mini_game_sessions (user_id, game_id, last_played, next_available, total_plays, best_score, total_sc_earned)
SELECT 
    u.id,
    'dogCatcher',
    '2000-01-01 00:00:00',
    '2000-01-01 00:00:00',
    0,
    0,
    0.00
FROM users u
WHERE u.id <= 5;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mini_game_results_leaderboard 
ON mini_game_results (game_id, score DESC, played_at DESC);

CREATE INDEX IF NOT EXISTS idx_mini_game_sessions_cooldown 
ON mini_game_sessions (user_id, game_id, next_available);
