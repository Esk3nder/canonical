#!/bin/bash
set -e

echo "Setting up local development environment..."

# Resolve env file: .env.local takes precedence (matches Next.js behavior)
ENV_FILE=".env"
[ -f .env.local ] && ENV_FILE=".env.local"

# Create .env if no env file exists
if [ ! -f .env ] && [ ! -f .env.local ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  ENV_FILE=".env"
else
  echo "Using $ENV_FILE..."
fi

# Safely read POSTGRES_URL from env file (no source, no shell expansion)
POSTGRES_URL=$(grep '^POSTGRES_URL=' "$ENV_FILE" | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//")

if [ -z "$POSTGRES_URL" ]; then
  echo "ERROR: POSTGRES_URL is not set in $ENV_FILE"
  exit 1
fi

export POSTGRES_URL

# Check for psql
if ! command -v psql &> /dev/null; then
  echo ""
  echo "ERROR: psql not found. Please install PostgreSQL."
  echo "  macOS: brew install postgresql@16"
  echo "  Ubuntu: sudo apt install postgresql"
  exit 1
fi

# Extract database name from POSTGRES_URL (last path segment, strip query params)
DB_NAME=$(echo "$POSTGRES_URL" | sed 's|.*/||' | sed 's|\?.*||')
# Build a maintenance URL by replacing only the final path segment with 'postgres'
MAINTENANCE_URL=$(echo "$POSTGRES_URL" | sed -E "s|/[^/?]+(\?.*)?$|/postgres\1|")

if [ -z "$DB_NAME" ]; then
  echo "ERROR: Could not parse database name from POSTGRES_URL"
  exit 1
fi

# Create database if it doesn't exist
if ! psql "$POSTGRES_URL" -c "SELECT 1" &> /dev/null; then
  echo "Creating database '$DB_NAME'..."
  psql "$MAINTENANCE_URL" -c "CREATE DATABASE \"$DB_NAME\";" 2>&1 || {
    echo "ERROR: Failed to create database '$DB_NAME'."
    echo "Make sure PostgreSQL is running and POSTGRES_URL is correct."
    exit 1
  }
fi

echo "PostgreSQL is ready!"

# Push schema
echo "Pushing database schema..."
npm run db:push

# Check if database has data and seed if empty
VALIDATOR_COUNT=$(psql "$POSTGRES_URL" -t -c "SELECT COUNT(*) FROM validators;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$VALIDATOR_COUNT" = "0" ] || [ -z "$VALIDATOR_COUNT" ]; then
  echo "Seeding database..."
  npm run db:seed
else
  echo "Database already has data ($VALIDATOR_COUNT validators), skipping seed..."
fi

echo ""
echo "Setup complete! Run 'npm run dev' to start the development server."
echo "Open http://localhost:3000"
