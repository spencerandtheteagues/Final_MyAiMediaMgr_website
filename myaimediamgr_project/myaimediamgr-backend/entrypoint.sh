#!/bin/sh
set -e

echo "--- Starting Gunicorn ---"
exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 120 src.main:app