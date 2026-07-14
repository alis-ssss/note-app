import React from 'react';
import { PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';

const NoteItem = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tags = note.tags ? note.tags.split(',').filter(tag => tag.trim()) : [];

  return (
    <div className="card mb-4 hover:shadow-lg transition-shadow duration-200 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {note.title}
          </h3>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Редактировать"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Удалить"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <TagIcon className="w-4 h-4 text-gray-400 mt-1" />
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-400 flex justify-between border-t pt-3">
        <span>Создано: {formatDate(note.created_at)}</span>
        <span>Обновлено: {formatDate(note.updated_at)}</span>
      </div>
    </div>
  );
};

export default NoteItem;