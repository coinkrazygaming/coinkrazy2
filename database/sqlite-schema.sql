-- CoinKriazy.com Casino Database Schema - SQLite Version
-- Complete social casino platform database for local development

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    phone TEXT,
    country TEXT NOT NULL,
    state TEXT,
    zip_code TEXT,
    gold_coins REAL DEFAULT 0.00,
    sweeps_coins REAL DEFAULT 0.00,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    kyc_documents TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified_at DATETIME,
    email_verification_token TEXT,
    email_verification_expires DATETIME,
    last_login DATETIME,
    registration_ip TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Game categories
CREATE TABLE IF NOT EXISTS game_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Game providers
CREATE TABLE IF NOT EXISTS game_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('slot', 'table', 'live_dealer', 'sports', 'bingo', 'mini_game')),
    thumbnail_url TEXT,
    demo_url TEXT,
    play_url TEXT,
    rtp REAL DEFAULT 96.00,
    volatility TEXT DEFAULT 'medium' CHECK (volatility IN ('low', 'medium', 'high', 'very_high')),
    min_bet REAL DEFAULT 0.10,
    max_bet REAL DEFAULT 500.00,
    max_win REAL DEFAULT 100000.00,
    features TEXT, -- JSON stored as text
    paylines INTEGER,
    reels INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    play_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES game_categories(id),
    FOREIGN KEY (provider_id) REFERENCES game_providers(id)
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE(user_id, game_id)
);

-- Game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    coin_type TEXT NOT NULL CHECK (coin_type IN ('gold', 'sweeps')),
    bet_amount REAL NOT NULL,
    total_wagered REAL DEFAULT 0.00,
    total_won REAL DEFAULT 0.00,
    spins_played INTEGER DEFAULT 0,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_end DATETIME,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Game results/spins
CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    coin_type TEXT NOT NULL CHECK (coin_type IN ('gold', 'sweeps')),
    bet_amount REAL NOT NULL,
    win_amount REAL DEFAULT 0.00,
    multiplier REAL DEFAULT 0.00,
    game_data TEXT, -- JSON stored as text
    result_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'game_win', 'game_loss', 'bonus', 'refund', 'purchase')),
    coin_type TEXT NOT NULL CHECK (coin_type IN ('gold', 'sweeps')),
    amount REAL NOT NULL,
    previous_balance REAL NOT NULL,
    new_balance REAL NOT NULL,
    description TEXT,
    reference_id TEXT,
    external_transaction_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    metadata TEXT, -- JSON stored as text
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Store packages
CREATE TABLE IF NOT EXISTS store_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    gold_coins REAL NOT NULL,
    bonus_sweeps_coins REAL DEFAULT 0.00,
    package_type TEXT NOT NULL CHECK (package_type IN ('starter', 'standard', 'premium', 'vip', 'mega', 'ultimate')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_provider TEXT NOT NULL,
    external_payment_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    gold_coins_received REAL NOT NULL,
    sweeps_coins_received REAL DEFAULT 0.00,
    payment_data TEXT, -- JSON stored as text
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES store_packages(id)
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    promo_type TEXT NOT NULL CHECK (promo_type IN ('welcome', 'daily', 'weekly', 'special', 'loyalty')),
    coin_type TEXT NOT NULL CHECK (coin_type IN ('gold', 'sweeps', 'both')),
    bonus_amount REAL NOT NULL,
    wagering_requirement INTEGER DEFAULT 1,
    max_redemptions INTEGER DEFAULT 1,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    terms_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User bonuses
CREATE TABLE IF NOT EXISTS user_bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    promotion_id INTEGER NOT NULL,
    bonus_amount REAL NOT NULL,
    wagering_requirement REAL NOT NULL,
    wagering_completed REAL DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    expires_at DATETIME NOT NULL,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

-- Mini game cooldowns
CREATE TABLE IF NOT EXISTS mini_game_cooldowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_slug TEXT NOT NULL,
    last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    cooldown_ends DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, game_slug)
);

-- Sports events
CREATE TABLE IF NOT EXISTS sports_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sport TEXT NOT NULL,
    league TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    event_date DATETIME NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    metadata TEXT, -- JSON stored as text
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sports odds
CREATE TABLE IF NOT EXISTS sports_odds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    bet_type TEXT NOT NULL,
    bet_option TEXT NOT NULL,
    odds REAL NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES sports_events(id)
);

-- Sports bets
CREATE TABLE IF NOT EXISTS sports_bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    odds_id INTEGER NOT NULL,
    bet_amount REAL NOT NULL,
    potential_win REAL NOT NULL,
    actual_win REAL DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'refunded')),
    placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settled_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES sports_events(id),
    FOREIGN KEY (odds_id) REFERENCES sports_odds(id)
);

-- Bingo rooms
CREATE TABLE IF NOT EXISTS bingo_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK (room_type IN ('75_ball', '90_ball', 'speed')),
    max_players INTEGER DEFAULT 100,
    ticket_price REAL NOT NULL,
    prize_pool REAL DEFAULT 0.00,
    game_duration_minutes INTEGER DEFAULT 5,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
    next_game_starts DATETIME NOT NULL,
    current_game_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bingo tickets
CREATE TABLE IF NOT EXISTS bingo_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    game_id TEXT NOT NULL,
    ticket_number TEXT NOT NULL,
    numbers TEXT NOT NULL, -- JSON stored as text
    marked_numbers TEXT DEFAULT '[]', -- JSON stored as text
    is_winner BOOLEAN DEFAULT FALSE,
    prize_won REAL DEFAULT 0.00,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES bingo_rooms(id)
);

-- Staff roles
CREATE TABLE IF NOT EXISTS staff_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL,
    permissions TEXT NOT NULL, -- JSON stored as text
    hourly_rate REAL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staff schedules
CREATE TABLE IF NOT EXISTS staff_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    shift_start DATETIME NOT NULL,
    shift_end DATETIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'missed')),
    hours_worked REAL DEFAULT 0.00,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES staff_roles(id)
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('account', 'payment', 'technical', 'game', 'general')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_to INTEGER,
    resolution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Support messages
CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_staff_reply BOOLEAN DEFAULT FALSE,
    attachments TEXT, -- JSON stored as text
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT, -- JSON stored as text
    new_values TEXT, -- JSON stored as text
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);
CREATE INDEX IF NOT EXISTS idx_games_provider ON games(provider_id);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(is_featured);
CREATE INDEX IF NOT EXISTS idx_games_popular ON games(is_popular);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_user ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game ON game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_session ON game_results(session_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
