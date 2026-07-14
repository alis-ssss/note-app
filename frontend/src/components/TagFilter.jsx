import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TagFilter = ({ notes, onTagSelect }) => {
  const [popularTags, setPopularTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Собираем все теги из заметок
    const allTags = notes.flatMap(note => 
      note.tags ? note.tags.split(',').map(tag => tag.trim()) : []
    );
    
    // Подсчитываем частоту тегов
    const tagFrequency = {};
    allTags.forEach(tag => {
      if (tag) {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      }
    });
    
    // Сортируем по частоте и берем топ-10
    const sortedTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
    
    setPopularTags(sortedTags);
  }, [notes]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onTagSelect(searchTerm.trim());
      setSearchTerm('');
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Фильтр по тегам
      </h3>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Введите тег для поиска..."
            className="input pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary py-1 px-4 text-sm"
          >
            Найти
          </button>
        </div>
      </form>
      
      {popularTags.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Популярные теги:</p>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={() => onTagSelect(null)}
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          Показать все заметки
        </button>
      </div>
    </div>
  );
};

export default TagFilter;