-- Chat Tables
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room VARCHAR(50) NOT NULL DEFAULT 'general',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_created (room, created_at),
    INDEX idx_user_created (user_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_mutes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    muted_by INT NOT NULL,
    reason VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_expires (user_id, expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (muted_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    reported_by INT NOT NULL,
    reason VARCHAR(255) DEFAULT 'inappropriate',
    status ENUM('pending', 'reviewed', 'dismissed') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_id (message_id),
    INDEX idx_reported_by (reported_by),
    INDEX idx_status (status),
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL,
    type ENUM('win', 'bonus', 'system', 'chat', 'achievement', 'warning') NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    amount DECIMAL(10,2) NULL,
    currency ENUM('GC', 'SC') NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    action_url VARCHAR(500) NULL,
    icon VARCHAR(50) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample chat messages for demo
INSERT INTO chat_messages (user_id, room, message, created_at) VALUES
(1, 'general', 'Welcome to CoinKrazy chat! 🎰', NOW() - INTERVAL 1 HOUR),
(2, 'general', 'Just hit a big win on Gold Rush! 💰', NOW() - INTERVAL 45 MINUTE),
(3, 'general', 'Anyone playing bingo tonight?', NOW() - INTERVAL 30 MINUTE),
(1, 'general', 'Good luck everyone! 🍀', NOW() - INTERVAL 20 MINUTE),
(4, 'vip', 'VIP lounge is the best! 👑', NOW() - INTERVAL 15 MINUTE),
(2, 'slots', 'What is your favorite slot game?', NOW() - INTERVAL 10 MINUTE),
(3, 'slots', 'I love Sweet Bonanza! So much fun! 🍭', NOW() - INTERVAL 5 MINUTE),
(1, 'general', 'Check out the new mini games! 🎯', NOW() - INTERVAL 2 MINUTE);

-- Sample notifications for demo
INSERT INTO notifications (user_id, type, title, message, amount, currency, priority, icon, created_at) VALUES
(1, 'win', '🎉 Big Win!', 'You won 500 GC playing Gold Rush Deluxe!', 500, 'GC', 'high', '🎰', NOW() - INTERVAL 1 HOUR),
(1, 'bonus', '🎁 Daily Bonus', 'Your daily login bonus is ready to claim!', 250, 'GC', 'medium', '🎁', NOW() - INTERVAL 2 HOUR),
(1, 'achievement', '🏆 Level Up!', 'Congratulations! You have reached level 15!', NULL, NULL, 'medium', '🏆', NOW() - INTERVAL 3 HOUR),
(1, 'system', '🔄 Maintenance', 'Scheduled maintenance tonight from 2-4 AM EST.', NULL, NULL, 'low', '⚙️', NOW() - INTERVAL 4 HOUR),
(2, 'win', '💎 Jackpot Hit!', 'Amazing! You won 25 SC on Diamond Deluxe!', 25, 'SC', 'high', '💎', NOW() - INTERVAL 30 MINUTE),
(2, 'bonus', '⭐ VIP Bonus', 'Special VIP bonus for loyal players!', 1000, 'GC', 'high', '👑', NOW() - INTERVAL 1 HOUR),
(3, 'achievement', '🎯 Mini Game Master', 'You completed all mini games today!', 100, 'GC', 'medium', '🎯', NOW() - INTERVAL 2 HOUR),
(3, 'chat', '💬 Chat Mention', 'Someone mentioned you in the VIP chat!', NULL, NULL, 'medium', '💬', NOW() - INTERVAL 10 MINUTE);
