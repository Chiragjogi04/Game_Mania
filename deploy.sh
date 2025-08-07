#!/bin/bash

# Game Mania Deployment Script
echo "🚀 Starting Game Mania deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

# Check if all required files exist
echo "🔍 Checking required files..."
required_files=("app.py" "requirements.txt" "Procfile" "runtime.txt")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📦 Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Test the application locally
echo "🧪 Testing application..."
python -c "from app import app; print('✅ App imports successfully')"

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin <your-github-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to your chosen platform:"
echo "   - Render: https://render.com"
echo "   - Railway: https://railway.app"
echo "   - Heroku: https://heroku.com"
echo "   - PythonAnywhere: https://pythonanywhere.com"
echo ""
echo "3. Set environment variables:"
echo "   - SECRET_KEY: Generate a random string"
echo "   - DATABASE_URL: Will be provided by platform"
echo ""