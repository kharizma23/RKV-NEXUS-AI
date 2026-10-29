#!/usr/bin/env bash
set -e

echo "Seeding database with development data..."
cd server
source .venv/bin/activate
python -m app.database.seed
cd ..
echo "Seeding complete!"
