# CoinKriazy.com Database Setup Guide

This guide will help you set up and connect your CoinKriazy casino website to a database.

## 🎯 Quick Start (SQLite - Recommended for Development)

The project is configured to use SQLite by default for easy development. No additional database server setup required!

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

```bash
node scripts/init-db-manual.js
```

### 3. Start the Application

```bash
npm run dev
```

### 4. Login to Test

- **Admin Account**:
  - Email: `coinkrazy00@gmail.com`
  - Password: `Woot6969!`
- **Staff Account**:
  - Email: `staff@coinkriazy.com`
  - Password: `Woot6969!`
- **Demo Player**:
  - Email: `demo1@coinkriazy.com`
  - Password: `Woot6969!`

## 🗄️ Database Options

### Option 1: SQLite (Default - No Setup Required)

- ✅ **Pros**: No server setup, file-based, perfect for development
- ✅ **Use Case**: Development, testing, small deployments
- 📁 **Database File**: `database/coinkriazy.db`

### Option 2: MySQL/MariaDB (Production Recommended)

- ✅ **Pros**: High performance, scalable, production-ready
- ✅ **Use Case**: Production deployments, high traffic
- 🔧 **Requires**: MySQL/MariaDB server

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Database Type (sqlite or mysql)
DB_TYPE=sqlite

# SQLite Configuration (when DB_TYPE=sqlite)
SQLITE_DB=database/coinkriazy.db

# MySQL Configuration (when DB_TYPE=mysql)
DB_HOST=localhost
DB_PORT=3306
DB_USER=coinkriazy_user
DB_PASSWORD=CoinKriazy2024!SecurePassword
DB_NAME=coinkriazy_casino
```

## 🔄 Switching to MySQL

### 1. Install MySQL/MariaDB

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (Homebrew)
brew install mysql

# Windows
# Download from: https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database and User

```sql
-- Login to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE coinkriazy_casino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'coinkriazy_user'@'localhost' IDENTIFIED BY 'CoinKriazy2024!SecurePassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON coinkriazy_casino.* TO 'coinkriazy_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Update Configuration

```bash
# Edit .env file
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=coinkriazy_user
DB_PASSWORD=CoinKriazy2024!SecurePassword
DB_NAME=coinkriazy_casino
```

### 4. Initialize MySQL Database

```bash
node scripts/setup-database.js
```

## 📊 Database Schema

The database includes comprehensive tables for:

### Core Tables

- **users** - User accounts, balances, KYC status
- **games** - Casino games catalog
- **game_categories** - Game organization
- **game_providers** - Game studio information
- **transactions** - All financial transactions
- **game_sessions** - Gameplay tracking
- **game_results** - Individual game outcomes

### Store & Promotions

- **store_packages** - Gold coin purchase packages
- **purchases** - User purchase history
- **promotions** - Bonus campaigns
- **user_bonuses** - Active user bonuses

### Sports & Bingo

- **sports_events** - Sports betting events
- **sports_odds** - Betting odds
- **sports_bets** - User bets
- **bingo_rooms** - Bingo game rooms
- **bingo_tickets** - User bingo tickets

### Support & Administration

- **support_tickets** - Customer support system
- **support_messages** - Ticket conversations
- **staff_roles** - Staff permission system
- **staff_schedules** - Staff work scheduling
- **audit_logs** - System activity tracking
- **system_settings** - Application configuration

## 🔧 Database Management

### Test Database Connection

```bash
node scripts/test-database.js
```

### Reset Database (SQLite)

```bash
rm database/coinkriazy.db
node scripts/init-db-manual.js
```

### Reset Database (MySQL)

```bash
mysql -u coinkriazy_user -p coinkriazy_casino < database/schema.sql
mysql -u coinkriazy_user -p coinkriazy_casino < database/seed_data.sql
```

### Backup Database (SQLite)

```bash
cp database/coinkriazy.db database/backup-$(date +%Y%m%d-%H%M%S).db
```

### Backup Database (MySQL)

```bash
mysqldump -u coinkriazy_user -p coinkriazy_casino > backup-$(date +%Y%m%d-%H%M%S).sql
```

## 📈 Production Deployment

### For Production Use:

1. **Use MySQL/MariaDB** for better performance and scalability
2. **Set strong passwords** in production environment
3. **Enable SSL/TLS** for database connections
4. **Regular backups** are essential
5. **Monitor performance** and optimize queries

### Environment Variables for Production:

```bash
DB_TYPE=mysql
DB_HOST=your-mysql-server.com
DB_PORT=3306
DB_USER=coinkriazy_prod_user
DB_PASSWORD=very_secure_production_password
DB_NAME=coinkriazy_casino_prod
```

## 🛠️ Troubleshooting

### SQLite Issues

- **Permission denied**: Check file permissions on `database/` directory
- **Database locked**: Make sure no other processes are using the database
- **File not found**: Run `node scripts/init-db-manual.js` to create database

### MySQL Issues

- **Connection refused**: Check if MySQL service is running
- **Access denied**: Verify username/password in .env file
- **Database doesn't exist**: Run database creation commands above
- **Table doesn't exist**: Run `node scripts/setup-database.js`

### General Issues

- **Module not found**: Run `npm install` to install dependencies
- **Query syntax error**: Check database type in .env matches your setup
- **Data not loading**: Verify seed data was inserted properly

## 📞 Support

If you encounter issues:

1. Check the console output for error messages
2. Verify your .env configuration
3. Ensure database server is running (for MySQL)
4. Try resetting the database with seed data
5. Check file permissions for SQLite

The database system is designed to be robust and provide clear error messages to help diagnose issues quickly.
