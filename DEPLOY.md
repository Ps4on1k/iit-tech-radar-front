# Развёртывание Docker-образа frontend на удалённой машине

## GitHub Container Registry

Docker-образы публикуются в **GitHub Container Registry (GHCR)**:

```
ghcr.io/<username>/<repository>:<tag>
```

## Теги образов

| Тег | Описание |
|-----|----------|
| `latest` | Последняя сборка с master |
| `v1.0.0` | Семантическая версия (при создании тега) |
| `sha-<hash>` | Сборка по коммиту |

---

## Скачивание и запуск на удалённой машине

### 1. Аутентификация в GHCR

```bash
# Создайте Personal Access Token на GitHub:
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# Scopes: read:packages

# Аутентификация
echo $GH_PAT | docker login ghcr.io -u <username> --password-stdin
```

### 2. Скачивание образа

```bash
# Последняя версия
docker pull ghcr.io/<username>/<repository>:latest

# Конкретная версия
docker pull ghcr.io/<username>/<repository>:v1.0.0
```

### 3. Запуск с помощью docker-compose

Создайте `docker-compose.yml` на удалённой машине:

```yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/<username>/<repository>:latest
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: ghcr.io/<username>/tech-radar-fullstack/backend:latest
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - DB_MODE=database
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=tech_radar
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=tech_radar
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Запуск:

```bash
# Создайте .env файл
cat > .env << EOF
VITE_API_URL=http://your-domain.com/api
JWT_SECRET=your-secret-key
FRONTEND_URL=http://your-domain.com
DB_PASSWORD=your-db-password
EOF

# Запуск
docker-compose up -d
```

### 4. Обновление образа

```bash
# Обновить образ
docker-compose pull

# Пересоздать контейнер
docker-compose up -d --force-recreate

# Очистить старые образы
docker image prune -f
```

---

## Настройка nginx (альтернатива docker-compose)

Если вы разворачиваете frontend отдельно на своём nginx:

### 1. Конфигурация nginx

```nginx
server {
    listen 80;
    server_name tech-radar.example.com;

    root /var/www/tech-radar/dist;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API запросов на backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Развёртывание

```bash
# Скопировать файлы из контейнера
docker create --name temp-frontend ghcr.io/<username>/<repository>:latest
docker cp temp-frontend:/usr/share/nginx/html/. /var/www/tech-radar/
docker rm temp-frontend

# Перезапустить nginx
sudo systemctl restart nginx
```

---

## Переменные окружения для сборки

При сборке образа можно передать переменные окружения через build args:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t tech-radar-frontend .
```

В GitHub Actions используйте repository variables:

1. Перейдите в Settings → Actions → Variables
2. Добавьте переменную `VITE_API_URL` со значением вашего API

---

## Автоматическое развёртывание

### Пример с Watchtower

```yaml
# docker-compose.yml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 frontend backend
    restart: unless-stopped
```

Watchtower будет проверять обновления каждые 5 минут и автоматически обновлять контейнеры.

---

## Проверка работы

```bash
# Проверка статуса
docker-compose ps

# Логи frontend
docker-compose logs -f frontend

# Логи backend
docker-compose logs -f backend

# Проверка доступности
curl http://localhost/
curl http://localhost:5000/api/tech-radar
```

---

## HTTPS настройка (production)

Для production рекомендуется использовать HTTPS. Пример с Let's Encrypt:

```yaml
# docker-compose.yml
services:
  frontend:
    image: ghcr.io/<username>/<repository>:latest
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    restart: unless-stopped

  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./certs:/etc/nginx/certs:ro
    restart: unless-stopped

  letsencrypt:
    image: nginxproxy/acme-companion
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./certs:/etc/nginx/certs:ro
      - ./acme:/etc/acme.sh
    environment:
      - DEFAULT_EMAIL=you@example.com
    depends_on:
      - nginx-proxy
    restart: unless-stopped
```

```bash
# Запуск с HTTPS
docker-compose up -d
```

---

## Troubleshooting

### Ошибка CORS

Если frontend не может подключиться к backend:

1. Проверьте `FRONTEND_URL` в `.env` backend
2. Убедитесь, что nginx правильно проксирует `/api` на backend

### Ошибка 404 при обновлении страницы

Добавьте в nginx конфигурацию:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Контейнер не запускается

```bash
# Проверить логи
docker-compose logs frontend

# Проверить состояние контейнера
docker-compose ps

# Пересоздать контейнер
docker-compose up -d --force-recreate frontend
```
