from database import get_db

class Note:
    @staticmethod
    def get_all():
        """Получить все заметки"""
        db = get_db()
        notes = db.execute(
            'SELECT * FROM notes ORDER BY updated_at DESC'
        ).fetchall()
        return [dict(note) for note in notes]

    @staticmethod
    def get_by_id(note_id):
        """Получить заметку по ID"""
        db = get_db()
        note = db.execute(
            'SELECT * FROM notes WHERE id = ?',
            (note_id,)
        ).fetchone()
        return dict(note) if note else None

    @staticmethod
    def create(title, content, tags):
        """Создать новую заметку"""
        db = get_db()
        cursor = db.execute(
            'INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)',
            (title, content, ','.join(tags) if tags else '')
        )
        db.commit()
        return cursor.lastrowid

    @staticmethod
    def update(note_id, title, content, tags):
        """Обновить существующую заметку"""
        db = get_db()
        db.execute(
            '''UPDATE notes 
               SET title = ?, content = ?, tags = ?
               WHERE id = ?''',
            (title, content, ','.join(tags) if tags else '', note_id)
        )
        db.commit()

    @staticmethod
    def delete(note_id):
        """Удалить заметку"""
        db = get_db()
        db.execute('DELETE FROM notes WHERE id = ?', (note_id,))
        db.commit()

    @staticmethod
    def search_by_tag(tag):
        """Найти заметки по тегу"""
        db = get_db()
        notes = db.execute(
            '''SELECT * FROM notes 
               WHERE tags LIKE ? 
               ORDER BY updated_at DESC''',
            (f'%{tag}%',)
        ).fetchall()
        return [dict(note) for note in notes]