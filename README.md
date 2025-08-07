# 🎮 Game Mania

A comprehensive gaming platform built with Flask, featuring multiple games, user authentication, community features, and leaderboards.
you can visit at [gamemania-lehj.onrender.com](https://gamemania-lehj.onrender.com/)
## 🚀 Features

- **Multiple Games**: Rock Paper Scissors, Sudoku, Tic Tac Toe, Wordle, 2048, Connect Four, Snake, Breakout
- **User Authentication**: Sign up, login, logout with profile management
- **Community Features**: Create posts, upload images, react with emojis, comment system
- **Leaderboards**: Track high scores and win rates across all games
- **Profile System**: Customizable profiles with avatars, bio, and game history
- **Responsive Design**: Modern UI that works on desktop and mobile

## 🛠️ Tech Stack

- **Backend**: Flask, SQLAlchemy, Flask-Login
- **Database**: SQLite (development) / PostgreSQL (production)
- **Frontend**: HTML, CSS, JavaScript
- **Deployment**: Gunicorn, Render/Heroku/Railway ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chiragjogi04/Game_Mania_Updated
   cd Game_Mania
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   # Option 1: Direct run
   python app.py or python3 app.py
   
   # Option 2: Using the run script (recommended)
   ./run.sh
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:8000`
   - If port 8000 is busy, the app will automatically use port 8001


## 🎯 Game Features

### Available Games

1. **Rock Paper Scissors** - Classic hand game
2. **Sudoku** - Number puzzle game
3. **Tic Tac Toe** - Strategic board game
4. **Wordle** - Word guessing game
5. **2048** - Number sliding puzzle
6. **Connect Four** - Strategy board game
7. **Snake** - Classic arcade game
8. **Breakout** - Brick breaking game

### Scoring System

- Each game tracks high scores
- Win/loss statistics are maintained
- Leaderboards show top players
- Personal game history available

## 👥 Community Features

- **Posts**: Create text and image posts
- **Reactions**: React with 👍, ❤️, 😂
- **Comments**: Comment on posts with threaded replies
- **Search**: Search posts and users
- **Mentions**: Mention users with @username
