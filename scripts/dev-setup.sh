#!/bin/bash
set -e

echo "Setting up local development environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
else
  echo ".env.local already exists, skipping..."
fi

# Clean up any stale containers
echo "Cleaning up stale containers..."
docker rm -f canonical-postgres canonical-migrate canonical-app 2>/dev/null || true

# Start postgres
echo "Starting PostgreSQL..."
docker compose up -d postgres

# Wait for postgres to be healthy
echo "Waiting for PostgreSQL to be ready..."
until docker exec canonical-postgres pg_isready -U canonical -d canonical_staking > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Check if database has data
VALIDATOR_COUNT=$(docker exec canonical-postgres psql -U canonical -d canonical_staking -t -c "SELECT COUNT(*) FROM validators;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$VALIDATOR_COUNT" = "0" ] || [ -z "$VALIDATOR_COUNT" ]; then
  echo "Running migrations and seeding..."
  npm run db:push
  npm run db:seed
else
  echo "Database already has data ($VALIDATOR_COUNT validators), skipping seed..."
fi

echo ""
echo "Setup complete! Run 'npm run dev' to start the development server."
echo "Open http://localhost:3000"
