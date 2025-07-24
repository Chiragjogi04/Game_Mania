# 🎮 Game Mania

**Game Mania** is a dynamic multi-game web application built with **Flask**, **Python**, **SQLAlchemy**, **HTML**, **CSS**, and **JavaScript**.  
It lets you play multiple games, compete on leaderboards, and connect with a community — all in one secure and beautifully designed platform.

---

## 📌 Features

✅ **Secure Authentication** — Login & Signup with safe session handling  
👤 **User Profiles** — View your stats, game history, high scores, and personal info  
🎮 **Multiple Games** — Play classics like Rock Paper Scissors, Sudoku, Tic Tac Toe, Snake, 2048, and more  
🏆 **Leaderboards** — Compete globally based on win rate and high scores  
💬 **Community** — Post, comment, and react to engage with other players  
✨ **Modern UI** — Clean responsive design with animations and radium green theme

---

## ⚙️ Tech Stack

- **Backend:** Flask (Python), SQLAlchemy  
- **Frontend:** HTML, CSS (custom & animations), JavaScript  
- **Database:** SQLite (file-based)

---

## 🚀 How to Run Game Mania Locally

Follow these steps to get the project running on your local machine.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Chiragjogi04/Game_Mania.git
cd game-mania

2️⃣ Create a Virtual Environment (Recommended)
# Create a virtual environment
python -m venv venv

# Activate the virtual environment

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

3️⃣ Install the Requirements
pip install -r requirements.txt

4️⃣ Initialize the Database
If this is your first time running the project, the database will be created automatically:

python app.py

✅ This will automatically create game_mania.db and the necessary tables.

5️⃣ Run the Application
python app.py

6️⃣ Open the App in Your Browser
Go to http://127.0.0.1:5000/
Create an account, log in, and start playing!
