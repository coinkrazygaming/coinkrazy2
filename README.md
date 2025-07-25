# CoinKrazy.com - Premier Social Casino Platform

![CoinKrazy.com](https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F94851f32130e47a4b85ad96fa19ed4ec?format=webp&width=800)

A complete social casino platform built with React, TypeScript, Node.js, Express, and MySQL. Features over 700+ slot games, live dealer tables, sports betting, bingo, mini-games, and comprehensive admin/staff management systems.

## 🎰 Features

### Casino Games

- **700+ Premium Slots** - Including Gold Rush Deluxe, Diamond Dreams, Dragon's Lair, and more
- **Live Dealer Games** - Real-time blackjack, roulette, baccarat with professional dealers
- **Table Games** - Classic casino games with various betting limits
- **Sports Betting** - Comprehensive sportsbook with live odds
- **Bingo Rooms** - Multiple bingo variants with live caller system
- **Mini Games** - 5 exclusive branded mini-games with 24-hour cooldowns

### User Features

- **Dual Currency System** - Gold Coins for fun play, Sweeps Coins for prizes
- **Welcome Bonus** - 10,000 Gold Coins + 10 Sweeps Coins for new players
- **Daily Bonuses** - 1,000 Gold Coins daily login rewards
- **Leveling System** - Experience points and level progression
- **Favorites & Recently Played** - Game organization and quick access
- **KYC Verification** - Secure identity verification for withdrawals

### Admin & Staff Systems

- **Complete Admin Panel** - User management, game settings, withdrawal processing
- **Staff Management** - Role-based access, scheduling, time tracking
- **Support Ticket System** - Integrated customer support with live chat
- **Audit Logs** - Complete activity tracking and security monitoring
- **Financial Controls** - RTP management, withdrawal limits, bonus controls

### Technical Features

- **Professional Casino Theme** - Blue and gold design with casino animations
- **Mobile Responsive** - Optimized for all devices
- **Real-time Gameplay** - WebSocket support for live features
- **Secure Payments** - Google Pay, Apple Pay, and credit card integration
- **Advanced Filtering** - Game search by provider, volatility, RTP, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd coinkriazy-casino
npm install
```

2. **Set up environment:**

```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

3. **Initialize database:**

```bash
node scripts/init-database.js
```

4. **Start development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📦 Production Deployment

### Automated Deployment

Run the complete deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script will:

- Install dependencies
- Initialize database with real data
- Build the application
- Set up systemd service
- Configure nginx
- Set up log rotation
- Create backup scripts
- Configure cron jobs

### Manual Deployment

1. **Install dependencies:**

```bash
npm install --production
```

2. **Set up database:**

```bash
# Create MySQL user and database
mysql -u root -p
CREATE DATABASE coinkriazy_casino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'coinkriazy_user'@'%' IDENTIFIED BY 'YourSecurePassword';
GRANT ALL PRIVILEGES ON coinkriazy_casino.* TO 'coinkriazy_user'@'%';
FLUSH PRIVILEGES;
EXIT;

# Initialize database
node scripts/init-database.js
```

3. **Build application:**

```bash
npm run build
```

4. **Start production server:**

```bash
npm start
```

## 🗄️ Database Structure

The platform includes comprehensive database schema with:

- **Users & Authentication** - Complete user management with KYC
- **Games & Providers** - 700+ games across 8 providers
- **Game Sessions & Results** - Detailed gameplay tracking
- **Transactions** - All financial activity logging
- **Store & Purchases** - 6 purchase packages ($4.99-$99.99)
- **Bonuses & Promotions** - Flexible bonus system
- **Sports Betting** - Events, odds, and bet tracking
- **Bingo System** - Rooms, tickets, and game management
- **Support System** - Tickets and live chat
- **Staff Management** - Roles, schedules, and time tracking
- **Audit Logs** - Complete activity monitoring

## 👥 Default Accounts

### Admin Account

- **Username:** admin
- **Email:** admin@coinkriazy.com
- **Password:** Use password reset or check database

### Staff Account

- **Username:** staff1
- **Email:** staff@coinkriazy.com
- **Password:** Use password reset or check database

### Demo Players

- 6 demo player accounts with realistic gaming history
- Usernames: player1-player6@coinkriazy.com

## 🎮 Game Features

### Slot Games

- **Advanced Filtering** - Provider, volatility, RTP, bet range
- **Game Preview Modals** - Detailed game information and stats
- **Dual Payment Options** - Red button for Gold Coins, Green for Sweeps
- **Favorites System** - Heart toggle for favorite games
- **Recently Played** - Quick access to recent games

### Mini Games

- **Branded Experience** - "CoinKriazy.com Exclusive" branding
- **Countdown Timers** - Real-time 24-hour cooldown tracking
- **Instant Rewards** - 500-5,000 Gold Coins per play
- **Difficulty Levels** - Visual difficulty indicators

### Live Dealer

- **Professional Dealers** - High-quality streaming
- **Multiple Tables** - Various betting limits
- **Real-time Chat** - Interact with dealers and players
- **VIP Tables** - High-limit exclusive tables

## 💰 Economy System

### Gold Coins (GC)

- Primary gaming currency
- Used for all slot and table games
- Earned through purchases, bonuses, and mini-games
- No cash value, for entertainment only

### Sweeps Coins (SC)

- Secondary currency for prize redemption
- Can be redeemed for cash prizes
- Earned through purchases and special promotions
- Subject to KYC verification for withdrawals

### Store Packages

1. **Starter Pack** - $4.99 (50,000 GC + 5 SC)
2. **Value Pack** - $9.99 (120,000 GC + 12 SC)
3. **Popular Pack** - $19.99 (275,000 GC + 28 SC)
4. **VIP Pack** - $49.99 (750,000 GC + 75 SC)
5. **Mega Pack** - $79.99 (1,300,000 GC + 130 SC)
6. **Ultimate Pack** - $99.99 (1,750,000 GC + 175 SC)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API protection against abuse
- **CORS Configuration** - Secure cross-origin requests
- **Helmet Security** - Security headers and protection
- **KYC Verification** - Identity verification for withdrawals
- **Audit Logging** - Complete activity tracking
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Parameterized queries

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Games

- `GET /api/games` - Get games with filters
- `GET /api/games/:slug` - Get game details
- `POST /api/games/:slug/play` - Start game session
- `POST /api/games/session/:token/spin` - Play game round

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/transactions` - Transaction history
- `POST /api/user/favorites/:gameId` - Toggle favorite

### Store

- `GET /api/store/packages` - Get store packages
- `POST /api/store/purchase` - Purchase package
- `GET /api/store/purchases` - Purchase history

### Admin (Admin access required)

- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/withdrawals` - Withdrawal management

### Staff (Staff access required)

- `GET /api/staff/dashboard` - Staff dashboard
- `GET /api/staff/tickets` - Support tickets
- `PUT /api/staff/tickets/:id` - Update ticket
- `GET /api/staff/kyc/pending` - Pending KYC reviews

## 📊 Monitoring & Maintenance

### Backup System

- Automated daily database backups
- Application file backups
- 7-day retention policy
- Manual backup script: `./scripts/backup.sh`

### Log Management

- Application logs in `/logs/` directory
- Automatic log rotation (30 days)
- Error logging and monitoring
- Access logs via nginx

### Health Monitoring

- `/api/health` endpoint for status checks
- Database connection monitoring
- Service status via systemd

## 🔧 Configuration

### Environment Variables

Key settings in `.env`:

- `NODE_ENV` - Environment (development/production)
- `DB_*` - Database connection settings
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed origins
- Payment processor settings
- Email configuration

### System Settings

Runtime settings configurable via admin panel:

- Welcome bonus amounts
- Daily bonus amounts
- Withdrawal limits
- KYC requirements
- Maintenance mode

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly game controls
- Mobile menu with organized sections
- Optimized loading for mobile networks
- Progressive Web App (PWA) ready

## 🎨 Customization

### Theming

- Blue and gold casino color scheme
- CSS custom properties for easy customization
- Casino-specific animations and effects
- Tailwind CSS for utility classes

### Game Integration

- Modular game provider system
- Easy addition of new games
- Configurable RTP and volatility
- Custom game features and metadata

## 📞 Support

### Built-in Support System

- Ticket system with categories and priorities
- Live chat integration
- Staff assignment and tracking
- Resolution time monitoring

### Documentation

- Complete API documentation
- Database schema documentation
- Deployment guides
- Troubleshooting guides

## 📜 License

This is a proprietary casino platform. All rights reserved.

## 🤝 Contributing

This is a private project. For support or customization requests, please contact the development team.

---

**CoinKriazy.com** - Where the excitement never stops! 🎰✨
