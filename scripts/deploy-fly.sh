#!/bin/bash

echo "🚀 Starting Fly.dev deployment..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null
then
    echo "❌ flyctl could not be found"
    echo "Please install flyctl: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Fly.dev
echo "🚀 Deploying to Fly.dev..."
flyctl deploy

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://coinkriazy-casino.fly.dev"
