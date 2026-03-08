#!/bin/bash

echo "🚀 AI Dev Platform - Quick Start"
echo "================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔥 Starting development server..."
echo ""
npm run dev
