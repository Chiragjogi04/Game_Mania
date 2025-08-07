import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user, UserMixin
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import humanize
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

# Database configuration
database_url = os.environ.get('DATABASE_URL', 'sqlite:///game_mania.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url

app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# =======================
# Models
# =======================

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=False, default='default-avatar.png')
    bio = db.Column(db.Text, default='')
    email = db.Column(db.String(255), default='')
    dob = db.Column(db.String(20), default='')
    gender = db.Column(db.String(20), default='')
    histories = db.relationship('GameHistory', backref='player', lazy=True)
    high_score_2048 = db.Column(db.Integer, default=0)
    high_score_snake = db.Column(db.Integer, default=0)
    high_score_breakout = db.Column(db.Integer, default=0)


class GameHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_name = db.Column(db.String(100), nullable=False)
    result = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    author = db.relationship('User', backref='posts')
    reactions = db.relationship('Reaction', backref='post', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')



class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emoji = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post'),)


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy=True)
    author = db.relationship('User')



# =======================
# Auth
# =======================

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.template_filter('timeago')
def timeago(dt):
    return humanize.naturaltime(datetime.utcnow() - dt)

# =======================
# Basic Pages
# =======================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/init-db')
def initialize_database():
    """Manual database initialization route for debugging"""
    try:
        with app.app_context():
            db.create_all()
        return jsonify({'status': 'success', 'message': 'Database initialized successfully'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        uname = request.form['username']
        pwd = request.form['password']
        if User.query.filter_by(username=uname).first():
            flash('Username already exists.', 'error')
            return redirect(url_for('signup'))
        hashed_pwd = generate_password_hash(pwd)
        new_user = User(username=uname, password=hashed_pwd)
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        uname = request.form['username']
        pwd = request.form['password']
        user = User.query.filter_by(username=uname).first()
        if not user or not check_password_hash(user.password, pwd):
            flash('Invalid credentials.', 'error')
            return redirect(url_for('login'))
        login_user(user)
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# =======================
# Profile
# =======================

@app.route('/upload_avatar', methods=['POST'])
@login_required
def upload_avatar():
    if 'avatar' not in request.files:
        flash('No file part.', 'error')
        return redirect(url_for('profile'))
    file = request.files['avatar']
    if file.filename == '':
        flash('No selected file.', 'error')
        return redirect(url_for('profile'))
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        current_user.profile_pic = filename
        db.session.commit()
        flash('Profile picture updated!', 'success')
    else:
        flash('Invalid file type.', 'error')
    return redirect(url_for('profile'))

@app.route('/profile')
@login_required
def profile():
    total = len(current_user.histories)
    wins = sum(1 for h in current_user.histories if h.result == 'win')
    counted = sum(1 for h in current_user.histories if h.result in ['win', 'lose', 'draw'])
    return render_template('profile.html',
                           user=current_user,
                           total_games=counted,
                           win_rate=(wins / counted * 100) if counted else 0,
                           history=current_user.histories)

@app.route('/profile/<username>')
@login_required
def view_profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    total = len(user.histories)
    wins = sum(1 for h in user.histories if h.result == 'win')
    counted = sum(1 for h in user.histories if h.result in ['win', 'lose', 'draw'])
    return render_template('profile.html',
                           user=user,
                           total_games=counted,
                           win_rate=(wins / counted * 100) if counted else 0,
                           history=user.histories)



@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    current_user.bio = request.form.get('bio', '').strip()
    current_user.email = request.form.get('email', '').strip()
    current_user.dob = request.form.get('dob', '').strip()
    current_user.gender = request.form.get('gender', '').strip()
    db.session.commit()
    flash('Profile updated!', 'success')
    return redirect(url_for('profile'))

# =======================
# Games
# =======================

@app.route('/games/<game_name>')
@login_required
def play_game(game_name):
    if game_name not in ['rock_paper_scissors', 'sudoku', 'tic_tac_toe', 'wordle', '2048', 'connect_four', 'snake', 'breakout']:
        return redirect(url_for('index'))
    high_score = None
    if game_name == '2048':
        high_score = current_user.high_score_2048
    elif game_name == 'snake':
        high_score = current_user.high_score_snake
    elif game_name == 'breakout':
        high_score = current_user.high_score_breakout
    return render_template(f'games/{game_name}.html', high_score=high_score)

@app.route('/update_2048_score', methods=['POST'])
@login_required
def update_2048_score():
    data = request.get_json()
    if data.get('high_score') > current_user.high_score_2048:
        current_user.high_score_2048 = data['high_score']
        db.session.commit()
    return jsonify({'status': 'success'})

@app.route('/update_snake_score', methods=['POST'])
@login_required
def update_snake_score():
    data = request.get_json()
    score = data.get('score')
    entry = GameHistory(game_name='snake', result=str(score), player=current_user)
    db.session.add(entry)
    if score > current_user.high_score_snake:
        current_user.high_score_snake = score
    db.session.commit()
    return jsonify({'status': 'success'})

@app.route('/update_breakout_score', methods=['POST'])
@login_required
def update_breakout_score():
    data = request.get_json()
    if data.get('high_score') > current_user.high_score_breakout:
        current_user.high_score_breakout = data['high_score']
        db.session.commit()
    return jsonify({'status': 'success'})

@app.route('/record_result', methods=['POST'])
@login_required
def record_result():
    game = request.form['game']
    result = request.form['result']
    db.session.add(GameHistory(game_name=game, result=result, player=current_user))
    db.session.commit()
    return ('', 204)

# =======================
# Leaderboard
# =======================

@app.route('/leaderboard')
@login_required
def leaderboard():
    users = User.query.all()
    ranked_by_win = [{
        'username': u.username,
        'profile_pic': u.profile_pic,
        'win_rate': (sum(1 for h in u.histories if h.result == 'win') / max(1, sum(1 for h in u.histories if h.result in ['win', 'lose', 'draw']))) * 100,
        'id': u.id
    } for u in users]
    ranked_by_win.sort(key=lambda x: x['win_rate'], reverse=True)
    top_by_win = ranked_by_win[:10]
    current_rank_win = next((i + 1 for i, u in enumerate(ranked_by_win) if u['id'] == current_user.id), None)
    ranked_by_snake = sorted(users, key=lambda u: u.high_score_snake, reverse=True)[:10]
    ranked_by_breakout = sorted(users, key=lambda u: u.high_score_breakout, reverse=True)[:10]
    return render_template('leaderboard.html', top_by_win=top_by_win, current_rank_win=current_rank_win,
                           top_by_snake=ranked_by_snake, top_by_breakout=ranked_by_breakout)

# =======================
# Community
# =======================

@app.route('/community')
@login_required
def community():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('q', '').strip()

    query = Post.query
    if search:
        query = query.join(User).filter(
            db.or_(
                Post.content.ilike(f'%{search}%'),
                User.username.ilike(f'%{search}%')
            )
        )

    posts_paginated = query.order_by(Post.timestamp.desc()).paginate(page=page, per_page=5)
    post_data = []
    for post in posts_paginated.items:
        post_data.append({
            'post': post,
            'likes': sum(1 for r in post.reactions if r.emoji == '👍'),
            'loves': sum(1 for r in post.reactions if r.emoji == '❤️'),
            'laughs': sum(1 for r in post.reactions if r.emoji == '😂'),
        })
    return render_template('community.html', posts=posts_paginated, post_data=post_data, search=search)


@app.route('/create_post', methods=['POST'])
@login_required
def create_post():
    content = request.form.get('content', '').strip()
    image = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image = filename
    if content or image:
        db.session.add(Post(content=content, image=image, author=current_user))
        db.session.commit()
    return redirect(url_for('community'))

@app.route('/react_post/<int:post_id>', methods=['POST'])
@login_required
def react_post(post_id):
    emoji = request.form.get('emoji')
    post = Post.query.get_or_404(post_id)
    reaction = Reaction.query.filter_by(user_id=current_user.id, post_id=post.id).first()
    if reaction:
        reaction.emoji = emoji
    else:
        db.session.add(Reaction(user_id=current_user.id, post_id=post.id, emoji=emoji))
    db.session.commit()
    return redirect(url_for('community'))

@app.route('/add_comment/<int:post_id>', methods=['POST'])
@login_required
def add_comment(post_id):
    text = request.form.get('text', '').strip()
    parent_id = request.form.get('parent_id')
    if text:
        comment = Comment(
            text=text,
            post_id=post_id,
            author_id=current_user.id,
            parent_id=int(parent_id) if parent_id else None
        )
        db.session.add(comment)
        db.session.commit()
    return redirect(url_for('community'))


@app.route('/edit_post/<int:post_id>', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author != current_user:
        flash("You can't edit someone else's post.", 'error')
        return redirect(url_for('community'))
    if request.method == 'POST':
        post.content = request.form.get('content', '').strip()
        db.session.commit()
        flash('Post updated!', 'success')
        return redirect(url_for('community'))
    return render_template('edit_post.html', post=post)

@app.route('/delete_post/<int:post_id>', methods=['POST'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author != current_user:
        flash("You can't delete someone else's post.", 'error')
        return redirect(url_for('community'))
    db.session.delete(post)
    db.session.commit()
    flash('Post deleted!', 'success')
    return redirect(url_for('community'))

@app.template_filter('link_mentions')
def link_mentions(text):
    mention_pattern = r'@(\w+)'
    return re.sub(mention_pattern, r'<a href="/profile/\1" class="mention">@\1</a>', text)

# =======================
# Run App
# =======================

# Initialize database tables
def init_db():
    with app.app_context():
        try:
            # Ensure upload folder exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            # Create all database tables
            db.create_all()
            print("✅ Database initialized successfully")
            
            # Check if we're using SQLite (development) or PostgreSQL (production)
            db_url = app.config['SQLALCHEMY_DATABASE_URI']
            if 'sqlite' in db_url:
                print("⚠️  Using SQLite - Data will be lost on service restart (development mode)")
            else:
                print("✅ Using PostgreSQL - Data will persist (production mode)")
                
        except Exception as e:
            print(f"⚠️  Database initialization warning: {e}")
            # Continue anyway - tables might already exist

# Initialize database on app startup
init_db()

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))
