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
