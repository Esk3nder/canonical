#!/bin/bash
set -e

echo "Setting up local development environment..."

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
else
  echo ".env already exists, skipping..."
fi

# Load env vars
set -a
source .env
set +a

if [ -z "$POSTGRES_URL" ]; then
  echo "ERROR: POSTGRES_URL is not set in .env"
  exit 1
fi

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
# Build a maintenance URL by replacing the DB name with 'postgres'
MAINTENANCE_URL=$(echo "$POSTGRES_URL" | sed "s|/${DB_NAME}|/postgres|")

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
