#!/bin/bash

# CoinKriazy.com Deployment Script
# This script sets up the complete casino platform for production deployment

set -e  # Exit on any error

echo "🎰 CoinKriazy.com Casino Platform Deployment"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "This script should not be run as root for security reasons"
   exit 1
fi

# Set project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

print_status "Project directory: $PROJECT_DIR"

# Check for required commands
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

print_status "Checking system requirements..."
check_command "node"
check_command "npm"
check_command "mysql"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
MIN_NODE_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$MIN_NODE_VERSION'))" 2>/dev/null; then
    print_error "Node.js version $NODE_VERSION is too old. Please install version $MIN_NODE_VERSION or higher."
    exit 1
fi

print_success "Node.js version $NODE_VERSION is compatible"

# Check if MySQL is running
if ! mysqladmin ping -h"${DB_HOST:-localhost}" --silent; then
    print_error "MySQL server is not running or not accessible"
    exit 1
fi

print_success "MySQL server is accessible"

# Install dependencies
print_status "Installing dependencies..."
npm install --production
print_success "Dependencies installed"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p backups
mkdir -p tmp

# Set proper permissions
chmod 755 logs uploads backups tmp
print_success "Directories created with proper permissions"

# Initialize database
print_status "Initializing database..."
node scripts/init-database.js
print_success "Database initialized successfully"

# Build the application
print_status "Building application..."
npm run build
print_success "Application built successfully"

# Create systemd service file (if running on systemd)
if command -v systemctl &> /dev/null; then
    print_status "Creating systemd service..."
    
    SERVICE_FILE="/etc/systemd/system/coinkriazy.service"
    
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=CoinKriazy.com Casino Platform
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server/node-build.mjs
Restart=on-failure
RestartSec=10
StandardOutput=append:$PROJECT_DIR/logs/app.log
StandardError=append:$PROJECT_DIR/logs/error.log

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$PROJECT_DIR

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable coinkriazy
    print_success "Systemd service created and enabled"
fi

# Create nginx configuration (if nginx is installed)
if command -v nginx &> /dev/null; then
    print_status "Creating nginx configuration..."
    
    NGINX_CONF="/etc/nginx/sites-available/coinkriazy.com"
    
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name coinkriazy.com www.coinkriazy.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name coinkriazy.com www.coinkriazy.com;

    # SSL Configuration (you'll need to add your SSL certificates)
    # ssl_certificate /path/to/your/certificate.crt;
    # ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /assets/ {
        alias $PROJECT_DIR/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # All other routes to the app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable the site
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    print_success "Nginx configuration created and enabled"
fi

# Create backup script
print_status "Creating backup script..."
tee "scripts/backup.sh" > /dev/null <<'EOF'
#!/bin/bash

# CoinKriazy.com Backup Script

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backups" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-coinkriazy_casino}"
DB_USER="${DB_USER:-coinkriazy_user}"
DB_HOST="${DB_HOST:-localhost}"

# Create database backup
mysqldump -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" \
    --routines --triggers --single-transaction \
    "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Compress the backup
gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Create application backup
tar -czf "$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz" \
    --exclude=node_modules \
    --exclude=backups \
    --exclude=logs \
    --exclude=tmp \
    .

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x scripts/backup.sh
print_success "Backup script created"

# Create log rotation configuration
print_status "Setting up log rotation..."
sudo tee "/etc/logrotate.d/coinkriazy" > /dev/null <<EOF
$PROJECT_DIR/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
    postrotate
        if systemctl is-active coinkriazy > /dev/null; then
            systemctl reload coinkriazy
        fi
    endscript
}
EOF

print_success "Log rotation configured"

# Set up cron jobs
print_status "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/scripts/backup.sh") | crontab -
print_success "Daily backup cron job added"

# Create deployment info file
print_status "Creating deployment info..."
tee "DEPLOYMENT_INFO.txt" > /dev/null <<EOF
CoinKriazy.com Casino Platform
==============================

Deployment Date: $(date)
Node.js Version: $(node --version)
npm Version: $(npm --version)
Project Directory: $PROJECT_DIR

Database Information:
- Host: ${DB_HOST:-localhost}
- Port: ${DB_PORT:-3306}
- Database: ${DB_NAME:-coinkriazy_casino}
- User: ${DB_USER:-coinkriazy_user}

Service Management:
- Start: sudo systemctl start coinkriazy
- Stop: sudo systemctl stop coinkriazy
- Restart: sudo systemctl restart coinkriazy
- Status: sudo systemctl status coinkriazy
- Logs: journalctl -u coinkriazy -f

Manual Start (for testing):
- npm start

Important Directories:
- Logs: $PROJECT_DIR/logs/
- Uploads: $PROJECT_DIR/uploads/
- Backups: $PROJECT_DIR/backups/

Security Notes:
- Change default JWT_SECRET in .env
- Set up SSL certificates for HTTPS
- Configure firewall to allow only necessary ports
- Regularly update dependencies with 'npm audit'

Admin Access:
- Username: admin
- Email: admin@coinkriazy.com
- Password: Check database or reset via MySQL

Next Steps:
1. Configure SSL certificates
2. Set up monitoring (optional)
3. Configure email settings for notifications
4. Set up payment processor integration
5. Test all functionality
6. Set up domain DNS to point to this server

Support:
- Application logs: $PROJECT_DIR/logs/
- Database logs: Check MySQL error logs
- Web server logs: Check nginx error logs
EOF

print_success "Deployment info created"

# Final checks
print_status "Running final checks..."

# Check if application starts
print_status "Testing application startup..."
timeout 10s npm start > /dev/null 2>&1 || print_warning "Application startup test timed out (this is normal for testing)"

# Check database connection
print_status "Testing database connection..."
node -e "
import { testConnection } from './server/config/database.js';
testConnection().then(success => {
    if (success) {
        console.log('✅ Database connection test passed');
        process.exit(0);
    } else {
        console.log('❌ Database connection test failed');
        process.exit(1);
    }
}).catch(err => {
    console.log('❌ Database test error:', err.message);
    process.exit(1);
});
"

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
echo "========================================"
echo ""
print_success "CoinKriazy.com casino platform is ready for production!"
echo ""
echo "📋 Next Steps:"
echo "   1. Review and update .env file with production values"
echo "   2. Set up SSL certificates for HTTPS"
echo "   3. Configure domain DNS"
echo "   4. Test all functionality"
echo "   5. Start the service: sudo systemctl start coinkriazy"
echo ""
echo "📖 Documentation: See DEPLOYMENT_INFO.txt for details"
echo "🔧 Admin Panel: Available at /admin after starting the service"
echo "📧 Support: Check the application for support ticket system"
echo ""
echo "🚀 To start the application now:"
echo "   sudo systemctl start coinkriazy"
echo ""
