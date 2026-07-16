FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --timeout 120 app:app
