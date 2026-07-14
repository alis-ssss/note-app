import React from 'react';
import NoteItem from './NoteItem';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const NoteList = ({ notes, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Загрузка заметок...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Заметок пока нет
        </h3>
        <p className="text-gray-600">
          Создайте первую заметку, нажав на кнопку "Новая заметка"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Мои заметки ({notes.length})
        </h2>
      </div>
      
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NoteList;