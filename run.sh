#!/bin/bash

# Game Mania Run Script
echo "🎮 Starting Game Mania..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/lib/python*/site-packages/flask" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if port 8000 is available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. Trying port 8001..."
    export PORT=8001
else
    export PORT=8000
fi

echo "🚀 Starting server on port $PORT..."
echo "🌐 Open your browser and go to: http://localhost:$PORT"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Run the application
python app.py 