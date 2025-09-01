#!/bin/bash

echo "🔧 Installing missing dependencies..."

# Install the missing autoprefixer dependency
npm install --save-dev autoprefixer@^10.4.16

echo "✅ Dependencies installed successfully!"
echo "🚀 Starting development server..."

# Clear cache and start dev server
npm run dev:clean
