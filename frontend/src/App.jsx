import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import NoteList from './components/NoteList';
import NoteForm from './components/NoteForm';
import TagFilter from './components/TagFilter';
import { notesAPI } from './api';

function App() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // Проверка статуса API
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await notesAPI.healthCheck();
        if (response.status === 200) {
          setApiStatus('healthy');
        }
      } catch (err) {
        setApiStatus('unhealthy');
        setError('API сервер недоступен');
      }
    };

    checkApiHealth();
  }, []);

  // Загрузка заметок
  // Загрузка заметок
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedTag) {
        const response = await notesAPI.searchByTag(selectedTag);
        setNotes(response.data);
        setFilteredNotes(response.data);
      } else {
        const response = await notesAPI.getAll();
        setNotes(response.data);
        setFilteredNotes(response.data);
      }
    } catch (err) {
      setError('Ошибка при загрузке заметок');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTag]); // ← зависимости useCallback

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]); // ← теперь правильно

  // Обработчики CRUD операций
  const handleCreateNote = async (noteData) => {
    try {
      await notesAPI.create(noteData);
      setShowForm(false);
      fetchNotes();
    } catch (err) {
      setError('Ошибка при создании заметки');
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      await notesAPI.update(editingNote.id, noteData);
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      setError('Ошибка при обновлении заметки');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      try {
        await notesAPI.delete(noteId);
        fetchNotes();
      } catch (err) {
        setError('Ошибка при удалении заметки');
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
  };

  const handleFormSubmit = (noteData) => {
    if (editingNote) {
      handleUpdateNote(noteData);
    } else {
      handleCreateNote(noteData);
    }
  };

  // Статистика
  const totalNotes = notes.length;
  const totalTags = new Set(
    notes.flatMap(note => note.tags ? note.tags.split(',').map(t => t.trim()) : [])
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📝 Notes App</h1>
              <p className="text-gray-600">Управляйте своими заметками с тегами</p>
            </div>

            <div className="flex items-center space-x-4">
              {apiStatus === 'healthy' ? (
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  API доступен
                </div>
              ) : (
                <div className="flex items-center text-sm text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  API недоступен
                </div>
              )}

              <button
                onClick={() => {
                  setEditingNote(null);
                  setShowForm(true);
                }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Новая заметка</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-900 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {totalNotes}
            </div>
            <div className="text-gray-600">Всего заметок</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {totalTags}
            </div>
            <div className="text-gray-600">Уникальных тегов</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {selectedTag || 'Все'}
            </div>
            <div className="text-gray-600">Текущий фильтр</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar с фильтрами */}
          <div className="lg:col-span-1">
            <TagFilter
              notes={notes}
              onTagSelect={handleTagSelect}
            />

            {selectedTag && (
              <div className="card mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Фильтр: <strong>{selectedTag}</strong></span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Список заметок */}
          <div className="lg:col-span-3">
            <NoteList
              notes={filteredNotes}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Форма создания/редактирования заметки */}
      {showForm && (
        <NoteForm
          note={editingNote}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Notes App &copy; {new Date().getFullYear()}</p>
          <p className="text-sm mt-2">
            Backend: Python Flask + SQLite | Frontend: React + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;