#!/bin/sh
set -e

echo "--- Running Database Migrations ---"
python -m flask --app src.main db upgrade
echo "--- Migrations Complete ---"

echo "--- Seeding Admin User ---"
python -m src.seed_admin
echo "--- Seeding Complete ---"

echo "--- Starting Gunicorn ---"
exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 120 src.main:app