#!/bin/bash

# Build the frontend and backend for Vercel deployment
echo "Building frontend and backend for Vercel deployment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the project
npm run build

# Create the 'public' directory if it doesn't exist
mkdir -p public

# Copy static assets to public directory if needed
if [ -d "dist" ]; then
  echo "Copying static assets to public directory..."
  cp -r dist/* public/
fi

echo "Build completed successfully!"