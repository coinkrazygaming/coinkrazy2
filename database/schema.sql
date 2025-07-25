-- CoinKriazy.com Casino Database Schema
-- Complete social casino platform database

-- Drop existing database if it exists and create new one
DROP DATABASE IF EXISTS coinkriazy_casino;
CREATE DATABASE coinkriazy_casino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coinkriazy_casino;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20),
    gold_coins DECIMAL(15,2) DEFAULT 10000.00,
    sweeps_coins DECIMAL(15,2) DEFAULT 10.00,
    level INT DEFAULT 1,
    experience_points INT DEFAULT 0,
    kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    kyc_documents TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    registration_ip VARCHAR(45),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_kyc_status (kyc_status)
);

-- Game categories
CREATE TABLE game_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game providers
CREATE TABLE game_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    provider_id INT NOT NULL,
    game_type ENUM('slot', 'table', 'live_dealer', 'sports', 'bingo', 'mini_game') NOT NULL,
    thumbnail_url VARCHAR(500),
    demo_url VARCHAR(500),
    play_url VARCHAR(500),
    rtp DECIMAL(5,2) DEFAULT 96.00,
    volatility ENUM('low', 'medium', 'high', 'very_high') DEFAULT 'medium',
    min_bet DECIMAL(10,2) DEFAULT 0.10,
    max_bet DECIMAL(10,2) DEFAULT 500.00,
    max_win DECIMAL(15,2) DEFAULT 100000.00,
    features JSON,
    paylines INT,
    reels INT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    play_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES game_categories(id),
    FOREIGN KEY (provider_id) REFERENCES game_providers(id),
    INDEX idx_category (category_id),
    INDEX idx_provider (provider_id),
    INDEX idx_game_type (game_type),
    INDEX idx_featured (is_featured),
    INDEX idx_popular (is_popular)
);

-- User favorites
CREATE TABLE user_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, game_id)
);

-- Game sessions
CREATE TABLE game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    coin_type ENUM('gold', 'sweeps') NOT NULL,
    bet_amount DECIMAL(10,2) NOT NULL,
    total_wagered DECIMAL(15,2) DEFAULT 0.00,
    total_won DECIMAL(15,2) DEFAULT 0.00,
    spins_played INT DEFAULT 0,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    INDEX idx_user_sessions (user_id),
    INDEX idx_game_sessions (game_id),
    INDEX idx_session_token (session_token)
);

-- Game results/spins
CREATE TABLE game_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    coin_type ENUM('gold', 'sweeps') NOT NULL,
    bet_amount DECIMAL(10,2) NOT NULL,
    win_amount DECIMAL(10,2) DEFAULT 0.00,
    multiplier DECIMAL(8,2) DEFAULT 0.00,
    game_data JSON,
    result_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    INDEX idx_user_results (user_id),
    INDEX idx_game_results (game_id),
    INDEX idx_session_results (session_id),
    INDEX idx_big_wins (win_amount)
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'game_win', 'game_loss', 'bonus', 'refund', 'purchase') NOT NULL,
    coin_type ENUM('gold', 'sweeps') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    previous_balance DECIMAL(15,2) NOT NULL,
    new_balance DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(255),
    external_transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_transactions (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Purchases/Store
CREATE TABLE store_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    gold_coins DECIMAL(15,2) NOT NULL,
    bonus_sweeps_coins DECIMAL(15,2) DEFAULT 0.00,
    package_type ENUM('starter', 'standard', 'premium', 'vip', 'mega', 'ultimate') NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_provider VARCHAR(100) NOT NULL,
    external_payment_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    gold_coins_received DECIMAL(15,2) NOT NULL,
    sweeps_coins_received DECIMAL(15,2) DEFAULT 0.00,
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES store_packages(id),
    INDEX idx_user_purchases (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Bonuses and promotions
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promo_type ENUM('welcome', 'daily', 'weekly', 'special', 'loyalty') NOT NULL,
    coin_type ENUM('gold', 'sweeps', 'both') NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    wagering_requirement INT DEFAULT 1,
    max_redemptions INT DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_promo_type (promo_type),
    INDEX idx_active_dates (is_active, start_date, end_date)
);

CREATE TABLE user_bonuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    promotion_id INT NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    wagering_requirement DECIMAL(15,2) NOT NULL,
    wagering_completed DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'expired', 'cancelled') DEFAULT 'active',
    expires_at TIMESTAMP NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    INDEX idx_user_bonuses (user_id),
    INDEX idx_status (status)
);

-- Mini games cooldowns
CREATE TABLE mini_game_cooldowns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_slug VARCHAR(100) NOT NULL,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cooldown_ends TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_game (user_id, game_slug),
    INDEX idx_cooldown_ends (cooldown_ends)
);

-- Sports betting
CREATE TABLE sports_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sport VARCHAR(100) NOT NULL,
    league VARCHAR(100) NOT NULL,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    status ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming',
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sport (sport),
    INDEX idx_status (status),
    INDEX idx_event_date (event_date)
);

CREATE TABLE sports_odds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    bet_type VARCHAR(100) NOT NULL,
    bet_option VARCHAR(255) NOT NULL,
    odds DECIMAL(8,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES sports_events(id),
    INDEX idx_event_odds (event_id),
    INDEX idx_bet_type (bet_type)
);

CREATE TABLE sports_bets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    odds_id INT NOT NULL,
    bet_amount DECIMAL(10,2) NOT NULL,
    potential_win DECIMAL(15,2) NOT NULL,
    actual_win DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('pending', 'won', 'lost', 'cancelled', 'refunded') DEFAULT 'pending',
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES sports_events(id),
    FOREIGN KEY (odds_id) REFERENCES sports_odds(id),
    INDEX idx_user_bets (user_id),
    INDEX idx_event_bets (event_id),
    INDEX idx_status (status)
);

-- Bingo
CREATE TABLE bingo_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    room_type ENUM('75_ball', '90_ball', 'speed') NOT NULL,
    max_players INT DEFAULT 100,
    ticket_price DECIMAL(10,2) NOT NULL,
    prize_pool DECIMAL(15,2) DEFAULT 0.00,
    game_duration_minutes INT DEFAULT 5,
    status ENUM('waiting', 'active', 'completed') DEFAULT 'waiting',
    next_game_starts TIMESTAMP NOT NULL,
    current_game_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_next_game (next_game_starts)
);

CREATE TABLE bingo_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    ticket_number VARCHAR(50) NOT NULL,
    numbers JSON NOT NULL,
    marked_numbers JSON DEFAULT '[]',
    is_winner BOOLEAN DEFAULT FALSE,
    prize_won DECIMAL(15,2) DEFAULT 0.00,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES bingo_rooms(id),
    INDEX idx_user_tickets (user_id),
    INDEX idx_room_game (room_id, game_id)
);

-- Staff management
CREATE TABLE staff_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    permissions JSON NOT NULL,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    shift_start TIMESTAMP NOT NULL,
    shift_end TIMESTAMP NOT NULL,
    status ENUM('scheduled', 'active', 'completed', 'missed') DEFAULT 'scheduled',
    hours_worked DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES staff_roles(id),
    INDEX idx_user_schedule (user_id),
    INDEX idx_shift_dates (shift_start, shift_end)
);

-- Support tickets
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category ENUM('account', 'payment', 'technical', 'game', 'general') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'waiting_user', 'resolved', 'closed') DEFAULT 'open',
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to INT NULL,
    resolution TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_user_tickets (user_id),
    INDEX idx_status (status),
    INDEX idx_assigned (assigned_to)
);

CREATE TABLE support_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_staff_reply BOOLEAN DEFAULT FALSE,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_ticket_messages (ticket_id),
    INDEX idx_created_at (created_at)
);

-- System settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Audit logs
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_audit (user_id),
    INDEX idx_action (action),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_created_at (created_at)
);
