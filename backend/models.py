from database import get_db, execute_db, is_postgres


class Note:
    @staticmethod
    def get_all():
        notes = execute_db(
            'SELECT * FROM notes ORDER BY updated_at DESC'
        ).fetchall()
        return [dict(note) for note in notes]

    @staticmethod
    def get_by_id(note_id):
        note = execute_db(
            'SELECT * FROM notes WHERE id = %s',
            (note_id,)
        ).fetchone()
        return dict(note) if note else None

    @staticmethod
    def create(title, content, tags):
        db = get_db()
        tags_str = ','.join(tags) if tags else ''
        if is_postgres():
            cursor = execute_db(
                'INSERT INTO notes (title, content, tags) VALUES (%s, %s, %s) RETURNING id',
                (title, content, tags_str)
            )
            note_id = cursor.fetchone()[0]
        else:
            cursor = execute_db(
                'INSERT INTO notes (title, content, tags) VALUES (%s, %s, %s)',
                (title, content, tags_str)
            )
            db.commit()
            note_id = cursor.lastrowid
        return note_id

    @staticmethod
    def update(note_id, title, content, tags):
        tags_str = ','.join(tags) if tags else ''
        execute_db(
            'UPDATE notes SET title = %s, content = %s, tags = %s, '
            'updated_at = CURRENT_TIMESTAMP WHERE id = %s',
            (title, content, tags_str, note_id)
        )
        get_db().commit()

    @staticmethod
    def delete(note_id):
        execute_db('DELETE FROM notes WHERE id = %s', (note_id,))
        get_db().commit()

    @staticmethod
    def search_by_tag(tag):
        notes = execute_db(
            'SELECT * FROM notes WHERE tags LIKE %s ORDER BY updated_at DESC',
            (f'%{tag}%',)
        ).fetchall()
        return [dict(note) for note in notes]
