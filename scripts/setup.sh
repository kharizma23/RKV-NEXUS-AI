#!/usr/bin/env bash
set -e

echo "Setting up RKV NEXUS AI development environment..."

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Setting up server virtual environment..."
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "Setting up client packages..."
cd client
npm install
cd ..

echo "Setup complete!"
