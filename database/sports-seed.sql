-- Sample sports events
INSERT OR REPLACE INTO sports_events (id, sport, league, home_team, away_team, event_date, status, home_score, away_score) VALUES
(1, 'NFL', 'NFL', 'Kansas City Chiefs', 'Buffalo Bills', '2024-12-22 20:00:00', 'upcoming', 0, 0),
(2, 'NBA', 'NBA', 'Los Angeles Lakers', 'Golden State Warriors', '2024-12-20 22:00:00', 'live', 89, 94),
(3, 'Soccer', 'La Liga', 'Real Madrid', 'FC Barcelona', '2024-12-21 21:00:00', 'upcoming', 0, 0),
(4, 'MMA', 'UFC', 'Jon Jones', 'Stipe Miocic', '2024-12-23 22:00:00', 'upcoming', 0, 0),
(5, 'Tennis', 'ATP', 'Novak Djokovic', 'Rafael Nadal', '2024-12-20 15:00:00', 'live', 0, 0),
(6, 'NHL', 'NHL', 'New York Rangers', 'Boston Bruins', '2024-12-21 19:00:00', 'upcoming', 0, 0),
(7, 'MLB', 'MLB', 'New York Yankees', 'Boston Red Sox', '2024-12-22 19:30:00', 'upcoming', 0, 0),
(8, 'Boxing', 'Professional', 'Tyson Fury', 'Oleksandr Usyk', '2024-12-24 22:00:00', 'upcoming', 0, 0);

-- Sample sports odds
INSERT OR REPLACE INTO sports_odds (id, event_id, bet_type, bet_option, odds) VALUES
(1, 1, 'moneyline', 'Kansas City Chiefs', 1.85),
(2, 1, 'moneyline', 'Buffalo Bills', 1.95),
(3, 2, 'moneyline', 'Los Angeles Lakers', 2.10),
(4, 2, 'moneyline', 'Golden State Warriors', 1.75),
(5, 3, 'moneyline', 'Real Madrid', 2.30),
(6, 3, 'moneyline', 'FC Barcelona', 2.80),
(7, 3, 'moneyline', 'Draw', 3.10),
(8, 4, 'moneyline', 'Jon Jones', 1.65),
(9, 4, 'moneyline', 'Stipe Miocic', 2.25),
(10, 5, 'moneyline', 'Novak Djokovic', 1.90),
(11, 5, 'moneyline', 'Rafael Nadal', 1.90);

-- Sample sports bets for today's statistics
INSERT OR REPLACE INTO sports_bets (user_id, event_id, odds_id, bet_amount, potential_win, actual_win, status, placed_at, settled_at) VALUES
-- Today's bets
(3, 1, 1, 50.00, 92.50, 0.00, 'pending', datetime('now', '-2 hours'), NULL),
(3, 2, 4, 25.00, 43.75, 0.00, 'pending', datetime('now', '-1 hour'), NULL),
(4, 3, 5, 100.00, 230.00, 0.00, 'pending', datetime('now', '-30 minutes'), NULL),
(5, 1, 2, 75.00, 146.25, 146.25, 'won', datetime('now', '-3 hours'), datetime('now', '-1 hour')),
(6, 2, 3, 40.00, 84.00, 0.00, 'lost', datetime('now', '-4 hours'), datetime('now', '-2 hours')),
(7, 4, 8, 200.00, 330.00, 0.00, 'pending', datetime('now', '-5 hours'), NULL),
(8, 5, 10, 60.00, 114.00, 114.00, 'won', datetime('now', '-6 hours'), datetime('now', '-3 hours')),
(3, 3, 6, 150.00, 420.00, 420.00, 'won', datetime('now', '-7 hours'), datetime('now', '-4 hours')),
(4, 1, 1, 80.00, 148.00, 0.00, 'pending', datetime('now', '-8 hours'), NULL),
(5, 2, 4, 35.00, 61.25, 0.00, 'lost', datetime('now', '-9 hours'), datetime('now', '-5 hours')),

-- Additional bets throughout the day
(6, 4, 9, 90.00, 202.50, 0.00, 'pending', datetime('now', '-10 hours'), NULL),
(7, 5, 11, 45.00, 85.50, 85.50, 'won', datetime('now', '-11 hours'), datetime('now', '-6 hours')),
(8, 1, 2, 120.00, 234.00, 0.00, 'pending', datetime('now', '-12 hours'), NULL),
(3, 3, 7, 70.00, 217.00, 0.00, 'lost', datetime('now', '-13 hours'), datetime('now', '-7 hours')),
(4, 2, 3, 55.00, 115.50, 0.00, 'pending', datetime('now', '-14 hours'), NULL),
(5, 4, 8, 300.00, 495.00, 0.00, 'pending', datetime('now', '-15 hours'), NULL),
(6, 5, 10, 85.00, 161.50, 161.50, 'won', datetime('now', '-16 hours'), datetime('now', '-8 hours')),
(7, 1, 1, 110.00, 203.50, 0.00, 'lost', datetime('now', '-17 hours'), datetime('now', '-9 hours')),
(8, 3, 5, 95.00, 218.50, 218.50, 'won', datetime('now', '-18 hours'), datetime('now', '-10 hours')),
(3, 2, 4, 65.00, 113.75, 0.00, 'pending', datetime('now', '-19 hours'), NULL),

-- Some bets from yesterday to show we have historical data
(4, 1, 1, 80.00, 148.00, 148.00, 'won', datetime('now', '-1 day', '-2 hours'), datetime('now', '-1 day', '-1 hour')),
(5, 2, 3, 120.00, 252.00, 0.00, 'lost', datetime('now', '-1 day', '-4 hours'), datetime('now', '-1 day', '-3 hours')),
(6, 3, 5, 200.00, 460.00, 460.00, 'won', datetime('now', '-1 day', '-6 hours'), datetime('now', '-1 day', '-5 hours')),
(7, 4, 8, 150.00, 247.50, 0.00, 'lost', datetime('now', '-1 day', '-8 hours'), datetime('now', '-1 day', '-7 hours')),
(8, 5, 10, 90.00, 171.00, 171.00, 'won', datetime('now', '-1 day', '-10 hours'), datetime('now', '-1 day', '-9 hours'));
