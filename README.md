# Разработка и настройка CI/CD-пайплайна для веб-приложения управления заметками с тегами

## Описание

Веб-приложение для создания и управления заметками. Пользователь может создавать, просматривать, редактировать и удалять заметки, а также назначать им теги для удобной категоризации и поиска.

### Эндпоинты REST API

| Метод   | Эндпоинт                | Описание                     |
|---------|------------------------|------------------------------|
| GET     | `/api/health`          | Проверка работоспособности   |
| GET     | `/api/notes`           | Получить все заметки         |
| GET     | `/api/notes/<id>`      | Получить заметку по ID       |
| POST    | `/api/notes`           | Создать новую заметку        |
| PUT     | `/api/notes/<id>`      | Обновить заметку             |
| DELETE  | `/api/notes/<id>`      | Удалить заметку              |
| GET     | `/api/notes/tag/<tag>` | Поиск заметок по тегу        |

## Технологии

| Технология         | Назначение                             |
|--------------------|----------------------------------------|
| Python             | Язык программирования backend          |
| Flask              | Веб-фреймворк                          |
| Gunicorn           | WSGI-сервер                            |
| SQLite / PostgreSQL| База данных (локально / Railway)       |
| psycopg2           | PostgreSQL-драйвер                     |
| Flake8             | Линтер Python                          |
| Pytest             | Тестирование Python                    |
| Node.js            | Среда выполнения JavaScript            |
| React              | UI библиотека                          |
| Tailwind CSS       | CSS фреймворк                          |
| ESLint             | Линтер JavaScript                      |
| Axios              | HTTP клиент                            |
| Nginx              | Прокси-сервер для frontend             |
| Docker             | Контейнеризация                        |
| Docker Compose     | Оркестрация контейнеров                |
| GitHub Actions     | CI автоматизация                       |
| Railway            | Хостинг и CD (Autodeploy)              |

## Запуск локально

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 --timeout 120 app:app
# или: python app.py
```

Сервер будет доступен на `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Приложение будет доступно на `http://localhost:3000`.

## Запуск в Docker

```bash
git clone <URL вашего репозитория>
cd 1
docker-compose up --build
```

После сборки будет запущено 3 сервиса:
- **PostgreSQL 16** — база данных (`notes_db`)
- **Backend** — Flask + Gunicorn на `http://localhost:5000`
- **Frontend** — React + Nginx на `http://localhost:3000`

Проверка:
- Backend API: `http://localhost:5000/api/health`
- Frontend: `http://localhost:3000`

## CI/CD

### CI Pipeline

Файл: `.github/workflows/ci.yml`

Запускается при **push** и **Pull Request** в ветки `main` и `develop`.

**Этапы CI:**
1. **Backend - Lint & Test** — flake8, pytest с покрытием, проверка импорта Flask
2. **Frontend - Lint & Test** — ESLint, сборка, тесты
3. **Docker Build** — сборка Docker-образов backend и frontend
4. **Integration Validation** — проверка структуры проекта

### CD Pipeline — Railway Autodeploy

Деплой происходит автоматически через **Railway Autodeploy** после merge в `main`.

**Механизм:**
1. Merge PR в `main` → запуск **CI** (GitHub Actions)
2. Railway ожидает успешного CI (**Wait for CI**)
3. После успеха — **Autodeploy** backend и frontend
4. Railway проверяет работоспособность (healthcheck `/api/health`)
5. Сервисы доступны по публичным URL

**Сервисы на Railway:**
- **PostgreSQL** — база данных (авто-инжект `DATABASE_URL`)
- **Backend** — Flask + Gunicorn
- **Frontend** — React + Nginx

> Переменные окружения задаются через интерфейс Railway (не `.env`).

## Переменные окружения

### Backend (`.env` — локально; Railway → Variables)

| Переменная      | Описание                          | Значение по умолчанию                              |
|-----------------|-----------------------------------|----------------------------------------------------|
| `FLASK_ENV`     | Режим запуска Flask               | `development`                                      |
| `PORT`          | Порт сервера                      | `5000`                                             |
| `DATABASE_URL`  | URL базы данных                   | `postgresql://notes_user:notes_pass@db:5432/notes_db` |

### Frontend (локально — `.env` / Railway → Variables)

| Переменная           | Описание                          | Значение                         |
|----------------------|-----------------------------------|----------------------------------|
| `REACT_APP_API_URL`  | Базовый URL для API (через Nginx) | `/api`                           |
| `API_URL`            | URL backend для Nginx proxy_pass  | `http://localhost:5000`          |

## Структура проекта

```
1/
├── backend/                  # Python Flask + Gunicorn API
│   ├── app.py                # Основное приложение Flask (REST endpoints)
│   ├── database.py           # SQLite/PostgreSQL инициализация и подключение
│   ├── models.py             # Модель Note (CRUD операции)
│   ├── Dockerfile            # Docker-образ для backend
│   ├── requirements.txt      # Python зависимости
│   ├── .env.example          # Шаблон переменных окружения
│   ├── railway.json          # Railway deploy config
│   └── tests/
│       └── test_api.py       # Unit-тесты API (pytest)
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── App.jsx           # Главный компонент
│   │   ├── api.js            # Axios клиент для API
│   │   ├── styles.css        # Tailwind CSS стили
│   │   ├── index.js          # Точка входа React
│   │   └── components/
│   │       ├── NoteForm.jsx  # Форма создания/редактирования
│   │       ├── NoteItem.jsx  # Карточка заметки
│   │       ├── NoteList.jsx  # Список заметок
│   │       └── TagFilter.jsx # Фильтр по тегам
│   ├── Dockerfile            # Multi-stage сборка (node → nginx)
│   ├── nginx.conf.template   # Nginx конфигурация (прокси API)
│   ├── railway.json          # Railway deploy config
│   ├── tailwind.config.js    # Tailwind CSS конфигурация
│   ├── postcss.config.js     # PostCSS конфигурация
│   └── package.json          # Node.js зависимости
├── .github/workflows/
│   ├── ci.yml                # CI pipeline (lint, test, docker build)
│   └── cd.yml.disabled       # CD (заменён на Railway Autodeploy)
├── docker-compose.yml        # Оркестрация 3 контейнеров (PG + backend + frontend)
├── .eslintrc.js              # ESLint конфигурация
├── .gitignore                # Игнорируемые файлы
├── generate_report.py        # Генератор отчёта
├── railway.json              # Railway root config
└── README.md                 # Документация проекта
```
