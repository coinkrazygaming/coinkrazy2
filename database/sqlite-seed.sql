-- CoinKriazy.com Casino Seed Data - SQLite Version
-- Real data for development and testing

-- Insert admin user (Email: coinkrazy00@gmail.com, Password: Woot6969!)
INSERT OR REPLACE INTO users (username, email, password_hash, first_name, last_name, date_of_birth, country, gold_coins, sweeps_coins, is_admin, is_staff, kyc_status, level, experience_points) VALUES
('admin', 'coinkrazy00@gmail.com', '$2b$10$rK5.c0Y7xJvUPmQYSx6F1.8KqHQJ6x8jBHgUQl5zK8xJvUPmQYSx6F', 'Casino', 'Administrator', '1990-01-01', 'United States', 1000000.00, 10000.00, 1, 1, 'verified', 50, 100000),
('staff1', 'staff@coinkriazy.com', '$2b$10$rK5.c0Y7xJvUPmQYSx6F1.8KqHQJ6x8jBHgUQl5zK8xJvUPmQYSx6F', 'Support', 'Staff', '1992-05-15', 'United States', 50000.00, 500.00, 0, 1, 'verified', 25, 25000);

-- Insert demo players with realistic data
INSERT OR REPLACE INTO users (username, email, password_hash, first_name, last_name, date_of_birth, country, gold_coins, sweeps_coins, kyc_status, level, experience_points, registration_date) VALUES
('player1', 'demo1@coinkriazy.com', '$2b$10$rGK8VzZ5o.Y8QY5qJ5x1vOKuJq9X8qJ5Y8QY5qJ5x1vOKuJq9X8qJ', 'Mike', 'Johnson', '1985-03-20', 'United States', 125000.00, 75.50, 'verified', 15, 8500, '2024-01-15 10:30:00'),
('player2', 'demo2@coinkriazy.com', '$2b$10$rGK8VzZ5o.Y8QY5qJ5x1vOKuJq9X8qJ5Y8QY5qJ5x1vOKuJq9X8qJ', 'Sarah', 'Williams', '1988-07-12', 'Canada', 89000.00, 42.25, 'verified', 12, 6200, '2024-01-18 14:15:00'),
('player3', 'demo3@coinkriazy.com', '$2b$10$rGK8VzZ5o.Y8QY5qJ5x1vOKuJq9X8qJ5Y8QY5qJ5x1vOKuJq9X8qJ', 'David', 'Brown', '1982-11-08', 'United Kingdom', 156000.00, 98.75, 'verified', 18, 12300, '2024-01-10 09:45:00'),
('player4', 'demo4@coinkriazy.com', '$2b$10$rGK8VzZ5o.Y8QY5qJ5x1vOKuJq9X8qJ5Y8QY5qJ5x1vOKuJq9X8qJ', 'Jessica', 'Miller', '1990-09-25', 'Australia', 67000.00, 28.30, 'pending', 8, 3800, '2024-02-01 16:20:00'),
('player5', 'demo5@coinkriazy.com', '$2b$10$rGK8VzZ5o.Y8QY5qJ5x1vOKuJq9X8qJ5Y8QY5qJ5x1vOKuJq9X8qJ', 'Alex', 'Davis', '1987-04-18', 'United States', 203000.00, 145.60, 'verified', 22, 18700, '2024-01-05 11:10:00'),
('player6', 'demo6@coinkriazy.com', '$2b$10$rGK8VzZ5o.Y8QY5qJ5x1vOKuJq9X8qJ5Y8QY5qJ5x1vOKuJq9X8qJ', 'Emma', 'Wilson', '1993-12-03', 'Germany', 78000.00, 55.80, 'verified', 10, 4900, '2024-01-22 13:35:00');

-- Game categories
INSERT OR REPLACE INTO game_categories (name, slug, description, icon, sort_order) VALUES
('Slots', 'slots', 'Premium slot machines with exciting themes and features', '🎰', 1),
('Table Games', 'table-games', 'Classic casino table games including blackjack and roulette', '🃏', 2),
('Live Dealer', 'live-dealer', 'Real-time games with professional dealers', '🎲', 3),
('Sports Betting', 'sports', 'Bet on your favorite sports with competitive odds', '⚽', 4),
('Bingo', 'bingo', 'Traditional and speed bingo with exciting prizes', '🎯', 5),
('Mini Games', 'mini-games', 'Quick and fun mini games with instant rewards', '🎮', 6);

-- Game providers
INSERT OR REPLACE INTO game_providers (name, slug, logo_url) VALUES
('Pragmatic Play', 'pragmatic-play', 'https://cdn.builder.io/api/v1/image/assets/pragmatic-play-logo.png'),
('NetEnt', 'netent', 'https://cdn.builder.io/api/v1/image/assets/netent-logo.png'),
('Play''n GO', 'playngo', 'https://cdn.builder.io/api/v1/image/assets/playngo-logo.png'),
('Microgaming', 'microgaming', 'https://cdn.builder.io/api/v1/image/assets/microgaming-logo.png'),
('Evolution Gaming', 'evolution', 'https://cdn.builder.io/api/v1/image/assets/evolution-logo.png'),
('Red Tiger', 'red-tiger', 'https://cdn.builder.io/api/v1/image/assets/redtiger-logo.png'),
('Big Time Gaming', 'big-time-gaming', 'https://cdn.builder.io/api/v1/image/assets/btg-logo.png'),
('CoinKriazy Studios', 'coinkriazy', 'https://cdn.builder.io/api/v1/image/assets/coinkriazy-logo.png');

-- Slot games with real data
INSERT OR REPLACE INTO games (name, slug, category_id, provider_id, game_type, thumbnail_url, rtp, volatility, min_bet, max_bet, max_win, features, paylines, reels, is_featured, is_new, is_popular, play_count) VALUES
('Gold Rush Deluxe', 'gold-rush-deluxe', 1, 1, 'slot', 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&h=600&fit=crop&crop=center', 96.50, 'high', 0.20, 100.00, 50000.00, '["Free Spins", "Wild Symbols", "Scatter Pays", "Bonus Round"]', 25, 5, 1, 0, 1, 15847),
('Diamond Dreams', 'diamond-dreams', 1, 2, 'slot', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=center', 97.20, 'medium', 0.10, 200.00, 75000.00, '["Expanding Wilds", "Multipliers", "Free Spins", "Jackpot"]', 20, 5, 1, 1, 1, 12653),
('Lucky 777', 'lucky-777', 1, 3, 'slot', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop&crop=center', 95.80, 'low', 0.25, 50.00, 25000.00, '["Classic Symbols", "Triple 7s", "Wild Symbols"]', 5, 3, 0, 0, 1, 9876),
('Wild Safari', 'wild-safari', 1, 1, 'slot', 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=400&h=600&fit=crop&crop=center', 96.80, 'very_high', 0.30, 150.00, 100000.00, '["Wild Animals", "Free Spins", "Scatter Pays", "Bonus Game"]', 30, 5, 1, 0, 0, 8924),
('Ocean Treasure', 'ocean-treasure', 1, 4, 'slot', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=600&fit=crop&crop=center', 96.20, 'medium', 0.15, 80.00, 40000.00, '["Underwater Theme", "Treasure Chest Bonus", "Free Spins"]', 15, 5, 0, 1, 0, 6754),
('Space Adventure', 'space-adventure', 1, 5, 'slot', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop&crop=center', 97.50, 'high', 0.40, 300.00, 120000.00, '["Cosmic Theme", "Planet Bonus", "Alien Wilds", "Galaxy Free Spins"]', 40, 6, 1, 1, 1, 11234),
('Mystic Fortune', 'mystic-fortune', 1, 2, 'slot', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&crop=center', 96.90, 'medium', 0.20, 120.00, 60000.00, '["Crystal Ball Bonus", "Magic Symbols", "Fortune Wheel"]', 25, 5, 0, 0, 1, 7892),
('Pirates Gold', 'pirates-gold', 1, 3, 'slot', 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=600&fit=crop&crop=center', 95.90, 'high', 0.25, 100.00, 45000.00, '["Pirate Theme", "Treasure Map Bonus", "Ship Wilds"]', 20, 5, 0, 1, 0, 5643),
('Egyptian Riches', 'egyptian-riches', 1, 1, 'slot', 'https://images.unsplash.com/photo-1543699565-003b8adda5fc?w=400&h=600&fit=crop&crop=center', 96.40, 'very_high', 0.50, 250.00, 150000.00, '["Pharaoh Bonus", "Pyramid Free Spins", "Ankh Symbols"]', 50, 5, 1, 0, 1, 14567),
('Fruit Frenzy', 'fruit-frenzy', 1, 6, 'slot', 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=600&fit=crop&crop=center', 94.80, 'low', 0.10, 25.00, 15000.00, '["Classic Fruits", "Simple Gameplay", "Wild Cherries"]', 10, 3, 0, 0, 0, 3245),
('Dragons Lair', 'dragons-lair', 1, 7, 'slot', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop&crop=center', 97.80, 'very_high', 0.60, 500.00, 200000.00, '["Dragon Bonus", "Fire Wilds", "Castle Free Spins", "Mega Ways"]', 117649, 6, 1, 1, 1, 18923),
('Vegas Nights', 'vegas-nights', 1, 2, 'slot', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop&crop=center', 96.10, 'medium', 0.30, 150.00, 70000.00, '["Vegas Theme", "Neon Lights", "Casino Bonus", "Jackpot Wheel"]', 30, 5, 0, 0, 1, 9876);

-- Table games
INSERT OR REPLACE INTO games (name, slug, category_id, provider_id, game_type, thumbnail_url, rtp, min_bet, max_bet, is_featured, is_popular) VALUES
('European Blackjack', 'european-blackjack', 2, 5, 'table', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center', 99.50, 1.00, 1000.00, 1, 1),
('American Roulette', 'american-roulette', 2, 5, 'table', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop&crop=center', 94.74, 0.50, 500.00, 1, 1),
('European Roulette', 'european-roulette', 2, 5, 'table', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center', 97.30, 0.50, 500.00, 1, 0),
('Baccarat', 'baccarat', 2, 5, 'table', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center', 98.90, 2.00, 2000.00, 0, 1),
('Casino Hold''em', 'casino-holdem', 2, 5, 'table', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center', 97.84, 1.00, 100.00, 0, 0);

-- Live dealer games
INSERT OR REPLACE INTO games (name, slug, category_id, provider_id, game_type, thumbnail_url, rtp, min_bet, max_bet, is_featured, is_popular) VALUES
('Live Blackjack VIP', 'live-blackjack-vip', 3, 5, 'live_dealer', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center', 99.28, 5.00, 5000.00, 1, 1),
('Live Roulette Gold', 'live-roulette-gold', 3, 5, 'live_dealer', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop&crop=center', 97.30, 1.00, 2500.00, 1, 1),
('Live Baccarat Prestige', 'live-baccarat-prestige', 3, 5, 'live_dealer', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center', 98.94, 10.00, 10000.00, 1, 0),
('Live Dream Catcher', 'live-dream-catcher', 3, 5, 'live_dealer', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop&crop=center', 96.58, 0.10, 100.00, 0, 1);

-- Mini games (CoinKriazy exclusives)
INSERT OR REPLACE INTO games (name, slug, category_id, provider_id, game_type, thumbnail_url, rtp, min_bet, max_bet, max_win, is_featured, is_new) VALUES
('Josey''s Duck Pond', 'joseys-duck-pond', 6, 8, 'mini_game', 'https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F72c742a5911d473691d607381841c43f?format=webp&width=800', 98.00, 10.00, 1000.00, 5000.00, 1, 1),
('Colin Shots', 'colin-shots', 6, 8, 'mini_game', 'https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2Fd814c0ccb6ff4f92a9beb83abec0bcd9?format=webp&width=800', 97.50, 25.00, 500.00, 2500.00, 1, 1),
('Crack the Vault', 'crack-the-vault', 6, 8, 'mini_game', 'https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F158ad80714ee4ada8f8c644f5204f766?format=webp&width=800', 96.80, 50.00, 2000.00, 10000.00, 1, 1),
('Lucky Wheel Spin', 'lucky-wheel-spin', 6, 8, 'mini_game', '/images/mini-games/lucky-wheel-spin.webp', 97.20, 20.00, 750.00, 3750.00, 1, 1),
('Number Guess Master', 'number-guess-master', 6, 8, 'mini_game', '/images/mini-games/number-guess-master.webp', 98.50, 15.00, 300.00, 1500.00, 1, 1),
('Coin Flip Challenge', 'coin-flip-challenge', 6, 8, 'mini_game', '/images/mini-games/coin-flip-challenge.webp', 97.80, 5.00, 200.00, 1000.00, 1, 1);

-- Store packages
INSERT OR REPLACE INTO store_packages (id, name, description, price, gold_coins, bonus_sweeps_coins, package_type, is_featured, sort_order) VALUES
(1, '🌟 Starter Pack', 'Perfect for new players!', 4.99, 5000, 5.00, 'starter', 0, 1),
(2, '🔥 Popular Pack', 'Most chosen by players!', 9.99, 15000, 15.00, 'standard', 1, 2),
(3, '💎 Value Pack', 'Great value for money!', 19.99, 30000, 35.00, 'premium', 0, 3),
(4, '👑 VIP Pack', 'Maximum value package!', 29.99, 50000, 60.00, 'vip', 0, 4),
(5, '🚀 Mega Pack', 'For serious players!', 49.99, 100000, 125.00, 'mega', 0, 5),
(6, '💫 Ultimate Pack', 'The ultimate experience!', 99.99, 250000, 300.00, 'ultimate', 1, 6);

-- Promotions
INSERT OR REPLACE INTO promotions (name, description, promo_type, coin_type, bonus_amount, wagering_requirement, max_redemptions, start_date, end_date, terms_conditions) VALUES
('Welcome Bonus', 'New player welcome bonus - 10,000 Gold Coins + 10 Sweeps Coins', 'welcome', 'both', 10000.00, 1, 1, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 'Available for new players only. One-time bonus.'),
('Daily Login Bonus', 'Daily bonus for active players', 'daily', 'gold', 1000.00, 1, 1, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 'Available once per day for logged-in users.'),
('Weekly Reload', 'Weekly bonus for all players', 'weekly', 'both', 5000.00, 3, 1, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 'Available once per week. Must have played at least once in the previous week.'),
('VIP Loyalty Bonus', 'Special bonus for VIP members', 'loyalty', 'both', 25000.00, 5, 1, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 'Available for VIP level players (Level 20+).');

-- Staff roles
INSERT OR REPLACE INTO staff_roles (role_name, permissions, hourly_rate) VALUES
('Customer Support', '["view_users", "respond_tickets", "view_transactions"]', 18.50),
('VIP Manager', '["view_users", "respond_tickets", "view_transactions", "manage_bonuses"]', 25.00),
('Security Analyst', '["view_users", "view_transactions", "security_reviews", "kyc_review"]', 28.00),
('Game Manager', '["view_games", "manage_games", "view_game_stats", "rtp_management"]', 32.00),
('Administrator', '["full_access"]', 45.00);

-- Bingo rooms
INSERT OR REPLACE INTO bingo_rooms (name, room_type, max_players, ticket_price, prize_pool, game_duration_minutes, next_game_starts) VALUES
('Lucky 75 Room', '75_ball', 100, 50.00, 2500.00, 8, datetime('now', '+5 minutes')),
('Speed Bingo', 'speed', 50, 25.00, 1000.00, 3, datetime('now', '+2 minutes')),
('90 Ball Classic', '90_ball', 150, 100.00, 7500.00, 12, datetime('now', '+8 minutes')),
('Mega Prize Room', '75_ball', 200, 200.00, 25000.00, 15, datetime('now', '+15 minutes'));

-- Sports events (sample upcoming events)
INSERT OR REPLACE INTO sports_events (sport, league, home_team, away_team, event_date, status) VALUES
('Football', 'NFL', 'Kansas City Chiefs', 'Buffalo Bills', datetime('now', '+3 days'), 'upcoming'),
('Basketball', 'NBA', 'Los Angeles Lakers', 'Boston Celtics', datetime('now', '+1 day'), 'upcoming'),
('Soccer', 'Premier League', 'Manchester United', 'Arsenal', datetime('now', '+2 days'), 'upcoming'),
('Tennis', 'ATP', 'Novak Djokovic', 'Carlos Alcaraz', datetime('now', '+5 days'), 'upcoming'),
('Baseball', 'MLB', 'New York Yankees', 'Houston Astros', datetime('now', '+4 days'), 'upcoming');

-- Sports odds for events
INSERT OR REPLACE INTO sports_odds (event_id, bet_type, bet_option, odds) VALUES
(1, 'moneyline', 'Kansas City Chiefs', 1.85),
(1, 'moneyline', 'Buffalo Bills', 1.95),
(1, 'spread', 'Chiefs -3.5', 1.90),
(1, 'spread', 'Bills +3.5', 1.90),
(1, 'total', 'Over 47.5', 1.85),
(1, 'total', 'Under 47.5', 1.95),
(2, 'moneyline', 'Lakers', 2.10),
(2, 'moneyline', 'Celtics', 1.75),
(3, 'moneyline', 'Man United', 2.25),
(3, 'moneyline', 'Arsenal', 1.65),
(3, 'draw', 'Draw', 3.40);

-- Sample transactions for realistic data
INSERT OR REPLACE INTO transactions (user_id, transaction_type, coin_type, amount, previous_balance, new_balance, description, status, created_at) VALUES
(3, 'purchase', 'gold', 120000.00, 5000.00, 125000.00, 'Value Pack Purchase', 'completed', '2024-02-01 10:30:00'),
(3, 'game_win', 'gold', 2500.00, 122500.00, 125000.00, 'Gold Rush Deluxe - Big Win!', 'completed', '2024-02-01 11:15:00'),
(4, 'game_loss', 'gold', -1500.00, 90500.00, 89000.00, 'Dragons Lair - Spin Loss', 'completed', '2024-02-01 14:22:00'),
(5, 'purchase', 'gold', 275000.00, 3000.00, 278000.00, 'Popular Pack Purchase', 'completed', '2024-01-28 16:45:00'),
(5, 'game_win', 'sweeps', 45.20, 100.40, 145.60, 'Live Blackjack VIP - Winning Hand', 'completed', '2024-02-01 19:30:00'),
(6, 'bonus', 'gold', 5000.00, 73000.00, 78000.00, 'Weekly Reload Bonus', 'completed', '2024-01-29 09:00:00'),
(3, 'withdrawal', 'sweeps', -25.50, 75.50, 50.00, 'Cash out to PayPal', 'completed', '2024-02-02 10:15:00'),
(4, 'withdrawal', 'sweeps', -15.30, 28.30, 13.00, 'Withdrawal to bank account', 'completed', '2024-02-02 14:45:00'),
(5, 'withdrawal', 'sweeps', -45.60, 145.60, 100.00, 'Large withdrawal - VIP processing', 'completed', '2024-02-02 16:30:00');

-- Game session examples
INSERT OR REPLACE INTO game_sessions (user_id, game_id, session_token, coin_type, bet_amount, total_wagered, total_won, spins_played, session_start, session_end, status) VALUES
(3, 1, 'session_123456789', 'gold', 25.00, 2500.00, 3750.00, 100, '2024-02-01 11:00:00', '2024-02-01 11:45:00', 'completed'),
(4, 11, 'session_987654321', 'sweeps', 2.50, 175.00, 85.00, 70, '2024-02-01 14:00:00', '2024-02-01 14:35:00', 'completed'),
(5, 13, 'session_456789123', 'gold', 50.00, 1500.00, 1200.00, 30, '2024-02-01 19:15:00', '2024-02-01 19:50:00', 'completed');

-- Sample big wins for recent wins display
INSERT OR REPLACE INTO game_results (session_id, user_id, game_id, coin_type, bet_amount, win_amount, multiplier, created_at) VALUES
(1, 3, 1, 'gold', 25.00, 1250.00, 50.00, '2024-02-01 11:25:00'),
(1, 3, 1, 'gold', 25.00, 750.00, 30.00, '2024-02-01 11:30:00'),
(2, 4, 11, 'sweeps', 2.50, 125.00, 50.00, '2024-02-01 14:20:00'),
(3, 5, 13, 'gold', 50.00, 2500.00, 50.00, '2024-02-01 19:40:00');

-- User favorites
INSERT OR REPLACE INTO user_favorites (user_id, game_id) VALUES
(3, 1), (3, 2), (3, 13),
(4, 11), (4, 2), (4, 15),
(5, 1), (5, 11), (5, 13), (5, 16),
(6, 2), (6, 12), (6, 14);

-- System settings
INSERT OR REPLACE INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'CoinKriazy.com', 'string', 'Website name'),
('site_description', 'Premier Social Casino Platform', 'string', 'Website description'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode toggle'),
('welcome_bonus_gc', '10000', 'number', 'Welcome bonus gold coins'),
('welcome_bonus_sc', '10', 'number', 'Welcome bonus sweeps coins'),
('daily_bonus_gc', '1000', 'number', 'Daily login bonus gold coins'),
('max_withdrawal_daily', '1000', 'number', 'Maximum daily withdrawal in USD'),
('kyc_required_threshold', '100', 'number', 'Withdrawal threshold requiring KYC'),
('support_email', 'support@coinkriazy.com', 'string', 'Support email address'),
('vip_level_requirement', '20', 'number', 'Level required for VIP status');

-- Sample support tickets
INSERT OR REPLACE INTO support_tickets (user_id, category, priority, subject, description, status) VALUES
(4, 'account', 'medium', 'KYC Document Upload Issue', 'Having trouble uploading my driver''s license for verification. The file seems to be the right size but keeps failing.', 'open'),
(6, 'payment', 'high', 'Withdrawal Request Pending', 'My withdrawal request has been pending for 3 days. Can you please check the status?', 'in_progress'),
(3, 'game', 'low', 'Game Loading Slowly', 'The Dragons Lair slot game takes a long time to load. Other games work fine.', 'resolved');

-- Staff schedules
INSERT OR REPLACE INTO staff_schedules (user_id, role_id, shift_start, shift_end, status, hours_worked) VALUES
(2, 1, '2024-02-01 09:00:00', '2024-02-01 17:00:00', 'completed', 8.00),
(2, 1, '2024-02-02 09:00:00', '2024-02-02 17:00:00', 'scheduled', 0.00);
