import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notesAPI = {
  // Получить все заметки
  getAll: () => api.get('/notes'),
  
  // Получить заметку по ID
  getById: (id) => api.get(`/notes/${id}`),
  
  // Создать новую заметку
  create: (noteData) => api.post('/notes', noteData),
  
  // Обновить заметку
  update: (id, noteData) => api.put(`/notes/${id}`, noteData),
  
  // Удалить заметку
  delete: (id) => api.delete(`/notes/${id}`),
  
  // Поиск по тегу
  searchByTag: (tag) => api.get(`/notes/tag/${tag}`),
  
  // Проверка здоровья API
  healthCheck: () => api.get('/health'),
};

export default api;