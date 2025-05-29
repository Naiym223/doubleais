#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for Futuristic AI Chat..."
echo "🧹 Cleaning previous builds..."

# Clean previous builds
rm -rf .next out

# Copy environment variables to ensure they're loaded
echo "📝 Setting up environment variables..."
cp .env.production .env

# Ensure all environment variables are set
export NEXT_STATIC_EXPORT=true
export SKIP_TYPESCRIPT_CHECK=1
export NEXT_SKIP_TYPE_CHECK=1
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_ESLINT=1

# Install dependencies
echo "📦 Installing dependencies with Bun..."
bun install

# Build the project
echo "🛠️ Building the project..."
bun run build-static

echo "✅ Build completed successfully!"
echo "🌐 The static site is ready in the 'out' directory."
echo "📤 You can now deploy this directory to your hosting provider."

# Create a zip file for Netlify
echo "📦 Creating zip file for deployment..."
cd out
zip -r ../futuristic-ai-chat-build.zip *
cd ..

echo "🎉 Deployment package created: futuristic-ai-chat-build.zip"
echo "🚀 You can now upload this file to Netlify or your hosting provider."
