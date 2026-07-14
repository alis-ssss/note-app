import sqlite3
from flask import g
import os

def get_db_path():
    """Получить путь к базе данных"""
    if 'RENDER' in os.environ:
        # На Render используем постоянное хранилище
        return '/etc/notes.db'
    return 'notes.db'

def init_db():
    """Инициализировать базу данных"""
    db = get_db()
    with db:
        db.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Создаем триггер для обновления updated_at
        db.execute('''
            CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
            AFTER UPDATE ON notes
            BEGIN
                UPDATE notes 
                SET updated_at = CURRENT_TIMESTAMP 
                WHERE id = NEW.id;
            END
        ''')

def get_db():
    """Получить соединение с базой данных"""
    if 'db' not in g:
        g.db = sqlite3.connect(
            get_db_path(),
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """Закрыть соединение с базой данных"""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_app(app):
    """Инициализировать приложение с базой данных"""
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()