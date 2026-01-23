#!/bin/bash
# E2E test script for data layer
# Run from project root: ./scripts/test-data-layer.sh

set -e

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🧪 Running data layer tests..."
npm run test -- tests/db/schema.test.ts tests/services/

echo ""
echo "✅ Data layer tests complete!"
