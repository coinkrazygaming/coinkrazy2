#!/bin/bash

# CoinKriazy.com Complete Casino Platform Package Creator
# Creates a production-ready deployment package

echo "🎰 Creating CoinKriazy.com Complete Casino Platform Package"
echo "=========================================================="

# Set package name and version
PACKAGE_NAME="coinkriazy-casino-complete"
VERSION="1.0.0"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_DIR="${PACKAGE_NAME}_${VERSION}_${TIMESTAMP}"

echo "📦 Package: $PACKAGE_DIR"

# Create package directory
mkdir -p "$PACKAGE_DIR"

# Copy essential files
echo "📋 Copying application files..."

# Core application files
cp -r client/ "$PACKAGE_DIR/"
cp -r server/ "$PACKAGE_DIR/"
cp -r shared/ "$PACKAGE_DIR/"
cp -r public/ "$PACKAGE_DIR/"
cp -r database/ "$PACKAGE_DIR/"
cp -r scripts/ "$PACKAGE_DIR/"

# Configuration files
cp package.json "$PACKAGE_DIR/"
cp package-lock.json "$PACKAGE_DIR/"
cp tsconfig.json "$PACKAGE_DIR/"
cp tailwind.config.ts "$PACKAGE_DIR/"
cp vite.config.ts "$PACKAGE_DIR/"
cp vite.config.server.ts "$PACKAGE_DIR/"
cp postcss.config.js "$PACKAGE_DIR/"
cp components.json "$PACKAGE_DIR/"
cp .prettierrc "$PACKAGE_DIR/"
cp .gitignore "$PACKAGE_DIR/"
cp .env.example "$PACKAGE_DIR/"
cp .env "$PACKAGE_DIR/"

# Documentation
cp README.md "$PACKAGE_DIR/"
cp -f index.html "$PACKAGE_DIR/"

# Create directories
mkdir -p "$PACKAGE_DIR/logs"
mkdir -p "$PACKAGE_DIR/uploads"
mkdir -p "$PACKAGE_DIR/backups"
mkdir -p "$PACKAGE_DIR/tmp"

# Create deployment info
cat > "$PACKAGE_DIR/DEPLOYMENT_INFO.txt" << EOF
CoinKriazy.com Casino Platform - Complete Package
================================================

Package Version: $VERSION
Created: $(date)
Platform: Social Casino Platform with MySQL Backend

CONTENTS:
---------
✅ Complete React frontend with casino theme
✅ Express.js backend with REST API
✅ MySQL database schema with real data
✅ 700+ slot games with real thumbnails
✅ Live dealer tables and sports betting
✅ Complete admin and staff panels
✅ User management with KYC system
✅ Dual currency system (Gold Coins + Sweeps Coins)
✅ Payment integration ready
✅ Security features and audit logging
✅ Deployment scripts and configuration

QUICK START:
-----------
1. Extract this package to your server
2. Install Node.js 18+ and MySQL 8.0+
3. Run: npm install
4. Configure database in .env file
5. Run: node scripts/init-database.js
6. Run: npm run build
7. Run: npm start

AUTOMATED DEPLOYMENT:
--------------------
1. Make deployment script executable: chmod +x scripts/deploy.sh
2. Run deployment script: ./scripts/deploy.sh
3. Follow the prompts for complete setup

DEFAULT ACCOUNTS:
----------------
Admin: admin@coinkriazy.com
Staff: staff@coinkriazy.com
Demo Players: player1-6@coinkriazy.com

FEATURES:
---------
🎰 700+ Premium Slot Games
🎲 Live Dealer Tables (Blackjack, Roulette, Baccarat)
⚽ Sports Betting with Live Odds
🎯 Bingo Rooms with Live Caller
🎮 5 Exclusive Mini Games
💰 6 Store Packages ($4.99 - $99.99)
👑 VIP System with Levels
🎁 Daily Bonuses and Promotions
📱 Mobile Responsive Design
🔒 Complete Security System
📊 Admin Dashboard and Controls
👥 Staff Management System
🎫 Support Ticket System
📈 Real-time Analytics
💳 Payment Integration Ready

DATABASE:
---------
- Complete schema with all tables
- Real game data with proper thumbnails
- Demo users with transaction history
- Store packages ready for purchase
- Support system ready to use
- Staff roles and permissions configured

TECHNICAL SPECS:
---------------
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + MySQL
- Authentication: JWT with secure sessions
- API: RESTful with comprehensive endpoints
- Security: Rate limiting, CORS, Helmet, validation
- Payments: Google Pay, Apple Pay, Credit Card ready
- Deployment: Systemd service, Nginx config, log rotation

SUPPORT:
--------
- Complete documentation in README.md
- API documentation included
- Troubleshooting guides provided
- All source code included and commented

This package contains everything needed for a production-ready
social casino platform deployment.

For technical support or customization requests,
refer to the documentation or contact the development team.

CoinKriazy.com - Where the excitement never stops! 🎰✨
EOF

# Create setup instructions
cat > "$PACKAGE_DIR/SETUP_INSTRUCTIONS.md" << EOF
# CoinKriazy.com Setup Instructions

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18.0 or higher
- MySQL 8.0 or higher
- At least 2GB RAM and 10GB disk space

## Quick Setup (Recommended)

1. **Extract the package:**
   \`\`\`bash
   tar -xzf coinkriazy-casino-complete.tar.gz
   cd coinkriazy-casino-complete_*
   \`\`\`

2. **Run automated deployment:**
   \`\`\`bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   \`\`\`

3. **Follow the prompts and you're done!**

## Manual Setup

1. **Install Node.js:**
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   \`\`\`

2. **Install MySQL:**
   \`\`\`bash
   sudo apt update
   sudo apt install mysql-server
   sudo mysql_secure_installation
   \`\`\`

3. **Configure MySQL:**
   \`\`\`bash
   sudo mysql
   CREATE DATABASE coinkriazy_casino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'coinkriazy_user'@'%' IDENTIFIED BY 'YourSecurePassword';
   GRANT ALL PRIVILEGES ON coinkriazy_casino.* TO 'coinkriazy_user'@'%';
   FLUSH PRIVILEGES;
   EXIT;
   \`\`\`

4. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

5. **Configure environment:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   nano .env
   \`\`\`

6. **Initialize database:**
   \`\`\`bash
   node scripts/init-database.js
   \`\`\`

7. **Build and start:**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## Verification

- Visit http://your-server-ip:3000
- Login with admin@coinkriazy.com (check database for password)
- Test game functionality
- Check admin panel at /admin

## Production Notes

- Set up SSL certificates for HTTPS
- Configure firewall rules
- Set up monitoring and backups
- Update default passwords
- Configure payment processors

## Support

See README.md for complete documentation and troubleshooting.
EOF

echo "✅ Package created successfully: $PACKAGE_DIR"

# Create the archive
echo "🗜️  Creating archive..."
tar -czf "${PACKAGE_DIR}.tar.gz" "$PACKAGE_DIR"
echo "✅ Archive created: ${PACKAGE_DIR}.tar.gz"

# Cleanup
rm -rf "$PACKAGE_DIR"

echo ""
echo "🎉 Package creation completed!"
echo "📦 Package file: ${PACKAGE_DIR}.tar.gz"
echo ""
echo "📋 Package Contents:"
echo "   ✅ Complete React frontend"
echo "   ✅ Express.js backend API"
echo "   ✅ MySQL database with real data"
echo "   ✅ 700+ games and casino features"
echo "   ✅ Admin and staff management"
echo "   ✅ Deployment scripts"
echo "   ✅ Complete documentation"
echo ""
echo "🚀 Ready for production deployment!"
echo "   Extract and run: ./scripts/deploy.sh"
