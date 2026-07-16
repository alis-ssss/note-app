import os
import sqlite3
from flask import g


def _is_test_mode():
    """Check if running in Flask test mode"""
    from flask import current_app
    if current_app and current_app.config.get('TESTING'):
        return True
    return False


def is_postgres():
    if _is_test_mode():
        return False
    return bool(os.environ.get('DATABASE_URL'))


def get_db():
    if 'db' not in g:
        from flask import current_app
        app = current_app

        if app and app.config.get('DATABASE'):
            g.db = sqlite3.connect(app.config['DATABASE'], detect_types=sqlite3.PARSE_DECLTYPES)
            g.db.row_factory = sqlite3.Row
        elif is_postgres():
            import psycopg2
            from psycopg2.extras import RealDictCursor
            g.db = psycopg2.connect(os.environ['DATABASE_URL'])
            g.db.cursor_factory = RealDictCursor
        else:
            g.db = sqlite3.connect('notes.db', detect_types=sqlite3.PARSE_DECLTYPES)
            g.db.row_factory = sqlite3.Row
    return g.db


def execute_db(query, params=None):
    db = get_db()
    if is_postgres():
        cursor = db.cursor()
        if params is not None:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        return cursor
    else:
        query = query.replace('%s', '?')
        if params is not None:
            return db.execute(query, params)
        return db.execute(query)


def init_db():
    db = get_db()
    if is_postgres():
        cursor = db.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()
    else:
        db.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
    db.commit()


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()
