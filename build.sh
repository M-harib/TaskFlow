#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Initialize database tables
python -c "from backend.app import app, db; app.app_context().push(); db.create_all()"
