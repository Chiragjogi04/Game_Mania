#!/usr/bin/env python3
"""
Debug script for Game Mania deployment issues
"""

import os
import sys
from app import app, db

def check_database():
    """Check database connection and tables"""
    print("🔍 Checking database...")
    try:
        with app.app_context():
            # Check if tables exist
            tables = db.engine.table_names()
            print(f"✅ Found tables: {tables}")
            
            # Try to create tables if they don't exist
            db.create_all()
            print("✅ Database tables created/verified")
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    return True

def check_static_files():
    """Check if required static files exist"""
    print("🔍 Checking static files...")
    required_files = [
        'static/images/bg1.jpg',
        'static/images/bg2.jpg',
        'static/css/style.css',
        'static/js/app.js'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
        else:
            print(f"✅ {file_path}")
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    return True

def check_environment():
    """Check environment variables"""
    print("🔍 Checking environment...")
    env_vars = {
        'SECRET_KEY': os.environ.get('SECRET_KEY', 'Not set'),
        'DATABASE_URL': os.environ.get('DATABASE_URL', 'Not set'),
        'PORT': os.environ.get('PORT', 'Not set')
    }
    
    for key, value in env_vars.items():
        if value == 'Not set':
            print(f"⚠️  {key}: {value}")
        else:
            print(f"✅ {key}: {'Set' if value else 'Not set'}")

def main():
    print("🚀 Game Mania Debug Script")
    print("=" * 40)
    
    check_environment()
    print()
    
    if check_database():
        print("✅ Database is ready")
    else:
        print("❌ Database issues found")
    
    print()
    
    if check_static_files():
        print("✅ Static files are ready")
    else:
        print("❌ Static file issues found")
    
    print()
    print("🎯 Debug complete!")

if __name__ == '__main__':
    main() 