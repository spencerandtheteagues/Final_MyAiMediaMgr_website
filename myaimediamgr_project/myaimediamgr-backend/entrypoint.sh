#!/bin/sh
set -e

echo "--- Running Database Migrations ---"
python -m flask --app src/main db upgrade
echo "--- Migrations Complete ---"

echo "--- Seeding Admin User ---"
python -m src.seed_admin
echo "--- Seeding Complete ---"

echo "--- Starting Gunicorn ---"
exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 src.main:app
