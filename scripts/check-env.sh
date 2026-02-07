#!/bin/bash
# Validates required environment variables before starting dev server

if [ ! -f .env ] && [ ! -f .env.local ]; then
  echo ""
  echo "ERROR: No .env file found!"
  echo ""
  echo "Run one of these commands to set up your environment:"
  echo "  npm run dev:setup    # Full setup (recommended for first time)"
  echo "  cp .env.example .env # Quick fix if DB is already running"
  echo ""
  exit 1
fi

# Load env file to check for required vars
ENV_FILE=".env"
[ -f .env.local ] && ENV_FILE=".env.local"

# Check that POSTGRES_URL is defined and non-empty
POSTGRES_URL_VALUE=$(grep '^POSTGRES_URL=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//")

if [ -z "$POSTGRES_URL_VALUE" ]; then
  echo ""
  if grep -q "^POSTGRES_URL=" "$ENV_FILE" 2>/dev/null; then
    echo "ERROR: POSTGRES_URL is empty in $ENV_FILE"
  else
    echo "ERROR: POSTGRES_URL is not set in $ENV_FILE"
  fi
  echo ""
  if grep -q "^DATABASE_URL=" "$ENV_FILE" 2>/dev/null; then
    echo "Found DATABASE_URL — this project now uses POSTGRES_URL instead."
    echo "Rename it in your $ENV_FILE:"
    echo "  Replace DATABASE_URL= with POSTGRES_URL= on the relevant line."
  else
    echo "Add it to your $ENV_FILE or run: npm run dev:setup"
  fi
  echo ""
  exit 1
fi
