# Tech Radar Frontend - Документация проекта

## Обзор

Frontend для приложения Tech Radar - системы визуализации и управления техническим радаром технологий.

**Стек технологий:**
- React 19 + TypeScript
- React Router (маршрутизация)
- Axios (HTTP клиент)
- Recharts (визуализация радара)
- Tailwind CSS (стилизация)
- Vite (сборка)

**Текущий режим:** Работа с backend API

---

## Структура проекта

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Навигационная панель
│   │   ├── PageHeader.tsx          # Шапка страницы с навигацией
│   │   ├── RadarChart.tsx          # Диаграмма радара (SVG)
│   │   ├── TechRadarTable.tsx      # Таблица с фильтрацией
│   │   ├── TechRadarModal.tsx      # Модальное окно (с редактированием для admin)
│   │   └── index.ts
│   ├── context/
│   │   └── AuthContext.tsx         # Контекст аутентификации
│   ├── pages/
│   │   ├── HomePage.tsx            # Главная страница (Обзор технологического стэка)
│   │   ├── LoginPage.tsx           # Страница входа
│   │   ├── UsersPage.tsx           # Управление пользователями (admin only)
│   │   ├── ImportPage.tsx          # Импорт/Экспорт данных (admin only)
│   │   ├── AuthCallbackPage.tsx    # Callback OAuth (не используется)
│   │   └── index.ts
│   ├── services/
│   │   └── api.ts                  # API клиент (axios)
│   ├── types/
│   │   └── index.ts                # TypeScript типы
│   ├── App.tsx                     # Корневой компонент
│   ├── App.css                     # Глобальные стили
│   ├── index.css                   # Базовые стили + Tailwind
│   └── main.tsx                    # Точка входа
├── index.html
├── package.json
├── vite.config.ts                  # Конфигурация Vite
├── tailwind.config.js              # Конфигурация Tailwind
├── postcss.config.cjs              # Конфигурация PostCSS
└── dist/                           # Production сборка
```

---

## Запуск проекта

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

**Фронтенд доступен на:** `http://localhost:3001`

### Сборка production
```bash
npm run build
npm run preview
```

---

## Интеграция с Backend

**URL API:** `http://localhost:5000/api`

### Настройка CORS

В `backend/.env` должен быть указан правильный URL фронтенда:
```env
FRONTEND_URL=http://localhost:3001
```

### Аутентификация

Токен сохраняется в `localStorage` и автоматически добавляется ко всем запросам через axios interceptor.

```typescript
// services/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Маршрутизация

| Путь | Компонент | Доступ | Описание |
|------|-----------|--------|----------|
| `/` | HomePage | Авторизованные | Главная страница с радаром (Обзор технологического стэка) |
| `/login` | LoginPage | Все | Страница входа |
| `/users` | UsersPage | Admin only | Управление пользователями (CRUD) |
| `/import` | ImportPage | Admin only | Импорт/Экспорт данных техрадара |
| `/auth/callback` | AuthCallbackPage | - | Не используется |
| `*` | Redirect to `/` | - | Редирект на главную |

### Protected Route

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

### Admin Route

Компонент для защиты роутов, доступных только администраторам:

```typescript
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

---

## Контекст аутентификации (AuthContext)

### Состояние
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}
```

### Методы
```typescript
const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

// Вход
await login('admin@techradar.local', 'password123');

// Выход
logout();

// Проверка прав
if (isAdmin) {
  // Только для администратора
}
```

### Использование
```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Выйти</button>
      ) : (
        <button onClick={() => login('email', 'password')}>Войти</button>
      )}
    </div>
  );
}
```

---

## Компоненты

### Navbar

Навигационная панель с информацией о пользователе.

**Props:** Нет

**Отображает:**
- Логотип "Tech Radar"
- Имя пользователя
- Бейдж "Администратор" (для admin)
- Кнопка "Выйти"

**Скрывается:** На странице входа

---

### RadarChart

Диаграмма технического радара (SVG визуализация).

**Props:**
```typescript
interface RadarChartProps {
  data: TechRadarEntity[];
  radarCategory?: TechRadarCategory;
  radarType?: TechRadarType;
  onPointClick?: (entity: TechRadarEntity) => void;
  onFilter?: (category?: TechRadarCategory, type?: TechRadarType) => void;
}
```

**Функционал:**
- Круговая диаграмма 625x625px
- 4 квадранта (Фреймворки, Инструменты, Языки, Библиотеки)
- 5 концентрических кругов (категории: adopt, trial, assess, hold, drop)
- Кластеризация технологий по типу и категории
- Размер точки зависит от количества технологий в кластере
- Tooltip при наведении (показывает все технологии в кластере)
- Клик на кластер:
  - Если 1 технология → открытие модалки (admin)
  - Если >1 технологии → фильтр таблицы по категории и типу
- Клик на легенду → фильтр по категории
- Кнопка "Сбросить фильтры"

**Визуализация:**
```
                    Фреймворки
                        ●
                        │
            Библиотеки ─┼─ Инструменты
                        │
                        ●
                       Языки

Круги (от центра):
  ○ Adopt (30%)
  ○ Trial (50%)
  ○ Assess (70%)
  ○ Hold (85%)
  ○ Drop (100%)
```

---

### TechRadarTable

Таблица технологий с фильтрацией, сортировкой и пагинацией.

**Props:**
```typescript
interface TechRadarTableProps {
  data: TechRadarEntity[];
  radarCategory?: TechRadarCategory;
  radarType?: TechRadarType;
  onRowClick?: (entity: TechRadarEntity) => void;
  onRadarFilter?: (category?: TechRadarCategory, type?: TechRadarType) => void;
}
```

**Колонки (в порядке отображения):**
1. Название (сортировка, фильтр: текст)
2. Версия (сортировка, фильтр: текст)
3. Категория (сортировка, фильтр: dropdown)
4. Риск (сортировка, фильтр: dropdown)
5. Тип (сортировка, фильтр: dropdown)
6. Подтип (сортировка, фильтр: dropdown)
7. Лицензия (сортировка, фильтр: текст)
8. Владелец (сортировка, фильтр: текст)

**Функционал:**
- Сортировка по клику на заголовок
- Фильтрация по каждой колонке
- Пагинация (10, 50, 100, Все)
- Навигация (Первая, ←, →, Последняя)
- Индикатор активных фильтров радара
- Кнопка "✕ Сбросить" для сброса всех фильтров
- Клик на строку → модалка (только admin)

---

### TechRadarModal

Модальное окно с полной информацией о технологии. **Для администраторов доступно редактирование всех полей.**

**Props:**
```typescript
interface TechRadarModalProps {
  entity: TechRadarEntity | null;
  onClose: () => void;
  onUpdate?: () => void;  // Callback после обновления
}
```

**Функционал для всех пользователей:**
- Просмотр полной информации о технологии
- Все секции: описание, характеристики, метрики, зависимости, ссылки

**Функционал для администраторов:**
- Редактирование всех текстовых полей (название, версия, описание, владелец)
- Выбор из dropdown: Тип, Подтип, Категория, Зрелость, Риск, Статус поддержки
- Редактирование дат (последнее обновление, дата выпуска, EOL)
- Управление тегами (заинтересованные стороны, зависимости, связанные технологии)
- Редактирование метрик (внедрение, популярность, размер сообщества)
- Требования к ресурсам (CPU, память, хранилище)
- URL поля (документация, внутреннее руководство)
- Кнопка удаления технологии

**Секции:**
1. **Header** - Название, версия, дата выпуска (редактируемые для admin)
2. **Описание** - Полное описание технологии (textarea для admin)
3. **Основная информация** - Тип, Подтип, Категория, Зрелость, Риск, Лицензия, Статус поддержки, Критичность, Стоимость, Привязка к вендору
4. **Даты** - Первое добавление, Последнее обновление, Дата выпуска, Дата окончания поддержки
5. **Владелец и команда** - Владелец, Заинтересованные стороны
6. **Технические характеристики** - Влияние на производительность, Требования к ресурсам, Совместимость
7. **Метрики** - Внедрение (%), Популярность (%), Размер сообщества, Частота вклада
8. **Зависимости** - Список зависимостей (формат: name:version:optional)
9. **Связанные технологии** - Тегами
10. **Рекомендуемые альтернативы** - Тегами
11. **Примеры использования** - Списком
12. **Безопасность и соответствие** - Уязвимости, Стандарты
13. **Документация и ссылки** - Ссылки на документацию

**Закрытие:**
- Клик на кнопку ×
- Клик вне модального окна
- Удаление технологии (для admin)

---

## Типы данных (TypeScript)

### TechRadarEntity
```typescript
type TechRadarType = 'фреймворк' | 'библиотека' | 'язык программирования' | 'инструмент';
type TechRadarSubtype = 'фронтенд' | 'бэкенд' | 'мобильная разработка' | 'инфраструктура' | 'аналитика' | 'DevOps' | 'SaaS' | 'библиотека';
type TechRadarCategory = 'adopt' | 'trial' | 'assess' | 'hold' | 'drop';
type MaturityLevel = 'experimental' | 'active' | 'stable' | 'deprecated' | 'end-of-life';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type SupportStatus = 'active' | 'limited' | 'end-of-life' | 'community-only';
type CostFactor = 'free' | 'paid' | 'subscription' | 'enterprise';
type ContributionFrequency = 'frequent' | 'regular' | 'occasional' | 'rare' | 'none';
type PerformanceImpact = 'low' | 'medium' | 'high';

interface TechRadarEntity {
  id: string;
  name: string;
  version: string;
  versionReleaseDate?: string;
  type: TechRadarType;
  subtype?: TechRadarSubtype;
  category: TechRadarCategory;
  description?: string;
  firstAdded: string;
  lastUpdated?: string;
  owner: string;
  stakeholders?: string[];
  dependencies?: Array<{ name: string; version: string; optional?: boolean }>;
  maturity: MaturityLevel;
  riskLevel: RiskLevel;
  license: string;
  usageExamples?: string[];
  documentationUrl?: string;
  internalGuideUrl?: string;
  adoptionRate?: number;
  recommendedAlternatives?: string[];
  relatedTechnologies?: string[];
  endOfLifeDate?: string;
  supportStatus: SupportStatus;
  upgradePath?: string;
  performanceImpact?: PerformanceImpact;
  resourceRequirements?: {
    cpu: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    memory: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    storage: 'минимальные' | 'низкие' | 'средние' | 'высокие';
  };
  securityVulnerabilities?: string[];
  complianceStandards?: string[];
  communitySize?: number;
  contributionFrequency?: ContributionFrequency;
  popularityIndex?: number;
  compatibility?: {
    os?: string[];
    browsers?: string[];
    frameworks?: string[];
  };
  costFactor?: CostFactor;
  vendorLockIn: boolean;
  businessCriticality: RiskLevel;
}
```

### AuthState
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
```

### FilterState
```typescript
interface FilterState {
  category?: TechRadarCategory;
  type?: TechRadarType;
  subtype?: TechRadarSubtype;
  maturity?: MaturityLevel;
  search?: string;
}
```

---

## API Сервис (services/api.ts)

### Tech Radar API
```typescript
import { techRadarApi } from './api';

// Получить все технологии
const data = await techRadarApi.getAll();

// Фильтрация и сортировка
const data = await techRadarApi.getFiltered({
  category: 'adopt',
  type: 'фреймворк'
}, {
  sortBy: 'name',
  sortOrder: 'asc'
});

// Поиск
const data = await techRadarApi.search('react');

// Статистика
const stats = await techRadarApi.getStatistics();

// CRUD (требуется Admin)
const entity = await techRadarApi.getById(id);
const created = await techRadarApi.create(entity);
const updated = await techRadarApi.update(id, partialEntity);
await techRadarApi.delete(id);
```

### Users API (Admin)
```typescript
import { authApi } from './api';

// Получить всех пользователей
const users = await authApi.getUsers();

// Создать пользователя
const created = await authApi.createUser({
  email: 'newuser@techradar.local',
  password: 'password123',
  firstName: 'Иван',
  lastName: 'Иванов',
  role: 'user'
});

// Обновить пользователя
const updated = await authApi.updateUser(id, {
  firstName: 'Петр',
  role: 'admin'
});

// Установить пароль
await authApi.setUserPassword(id, 'newpassword123');

// Блокировать/Разблокировать
await authApi.toggleUserStatus(id);

// Удалить пользователя
await authApi.deleteUser(id);

// Сменить свой пароль
await authApi.changePassword('oldPassword', 'newPassword');
```

### Import API
```typescript
import { importApi } from './api';

// Импорт технологий
const result = await importApi.importTechRadar(data, {
  skipExisting: true,    // Пропускать существующие
  updateExisting: true   // Обновлять существующие
});

// Экспорт технологий
const data = await importApi.exportTechRadar();

// Валидация перед импортом
const validation = await importApi.validateTechRadar(data);
```

---

## Учетные записи

| Роль | Email | Пароль |
|------|-------|--------|
| **Admin** | admin@techradar.local | password123 |
| **User** | user@techradar.local | password123 |

**Права доступа:**
- **Admin**: Полный доступ (CRUD техрадара, управление пользователями, импорт/экспорт, редактирование в модалке)
- **User**: Только чтение (просмотр техрадара, просмотр модалки без редактирования)

---

## Страницы

### LoginPage

**Путь:** `/login`

**Функционал:**
- Форма входа (email + пароль)
- Отображение ошибок аутентификации
- Редирект на главную после успешного входа

### HomePage

**Заголовок:** "Обзор технологического стэка"

**Функционал:**
- PageHeader с навигацией и информацией о пользователе
- RadarChart с визуализацией технологий
- Статистика по категориям (Adopt, Trial, Assess, Hold/Drop)
- TechRadarTable с фильтрацией и сортировкой
- TechRadarModal при клике на технологию (просмотр для всех, редактирование для admin)
- Интеграция фильтров радара и таблицы

### UsersPage

**Путь:** `/users`

**Доступ:** Только для администраторов

**Функционал:**
- Просмотр списка всех пользователей
- Создание нового пользователя (email, пароль, имя, фамилия, роль)
- Редактирование данных пользователя
- Сброс пароля пользователя
- Блокировка/разблокировка (toggle isActive)
- Удаление пользователя
- Отображение статуса (Активен/Заблокирован) и роли

**Элементы управления:**
- Таблица пользователей с колонками: Email, ФИО, Роль, Статус, Действия
- Модальное окно создания/редактирования
- Кнопки действий: Редактировать, Сброс пароля, Заблокировать/Разблокировать, Удалить

### ImportPage

**Путь:** `/import`

**Доступ:** Только для администраторов

**Функционал:**
- **Импорт данных:**
  - Загрузка JSON файла (drag & drop или выбор)
  - Выбор режима импорта:
    - **Пропускать** - не изменять существующие записи
    - **Обновлять** - изменять существующие записи
    - **Заменить всё** - полная замена данных
  - Валидация данных перед импортом
  - Предпросмотр результатов валидации
  - Отображение результатов импорта
  - Редирект на главную после успешного импорта

- **Экспорт данных:**
  - Выгрузка всех технологий в JSON файл
  - Автоматическое скачивание файла с датой в имени

**Результаты валидации:**
- Всего записей
- Валидные/Невалидные
- Список ошибок по записям

**Результаты импорта:**
- Импортировано
- Обновлено
- Пропущено
- Ошибки импорта

---

## Стилизация

### Tailwind CSS

Используется для утилитарных классов в компонентах.

**Пример:**
```tsx
<div className="min-h-screen bg-gray-100">
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
</div>
```

### Inline стили

Используются для динамических значений и сложной логики.

**Пример:**
```tsx
<div style={{
  background: CATEGORY_COLORS[entity.category] + '20',
  color: CATEGORY_COLORS[entity.category],
}}>
```

---

## Задачи для дальнейшей разработки

### [ ] Улучшение UX
- [ ] Лоадеры для асинхронных операций
- [ ] Toast уведомления об успеха/ошибках
- [ ] Подтверждение удаления
- [ ] Поиск с debounce

### [ ] Новые функции
- [ ] Экспорт таблицы (CSV, Excel)
- [ ] Печать страницы
- [ ] Избранные технологии
- [ ] История изменений
- [ ] Сравнение технологий

### [ ] Улучшение радара
- [ ] Анимация точек
- [ ] Zoom/Pan
- [ ] Экспорт в PNG/SVG
- [ ] Настройка отображения

### [ ] Оптимизация
- [ ] Code splitting
- [ ] Lazy loading компонентов
- [ ] Кэширование запросов (React Query)
- [ ] Мемоизация тяжелых вычислений

### [ ] Тесты
- [ ] Unit тесты компонентов
- [ ] Integration тесты
- [ ] E2E тесты (Playwright/Cypress)

### [ ] Доступность
- [ ] ARIA атрибуты
- [ ] Клавиатурная навигация
- [ ] Screen reader поддержка

---

## Зависимости

### Основные
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.1",
  "axios": "^1.13.6",
  "recharts": "^3.7.0",
  "@tanstack/react-table": "^8.21.3",
  "bootstrap": "^5.3.8",
  "react-bootstrap": "^2.10.10"
}
```

### Dev зависимости
```json
{
  "typescript": "~5.9.3",
  "vite": "^5.4.21",
  "@vitejs/plugin-react": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.5.6",
  "autoprefixer": "^10.4.27"
}
```

---

## Сборка и деплой

### Development
```bash
npm run dev
```

### Production сборка
```bash
npm run build
```

**Результат:** Папка `dist/` с оптимизированными файлами

### Preview production
```bash
npm run preview
```

### Деплой

1. Собрать проект: `npm run build`
2. Загрузить `dist/` на хостинг
3. Настроить проксирование API запросов на backend

**Пример nginx конфигурации:**
```nginx
server {
  listen 80;
  server_name tech-radar.example.com;

  root /var/www/tech-radar/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## Docker развёртывание

### Сборка образа

```bash
docker build -t tech-radar-frontend .
```

### Запуск контейнера

```bash
docker run -d -p 80:80 tech-radar-frontend
```

### Docker Compose

Для развёртывания вместе с backend используйте [`DEPLOY.md`](./DEPLOY.md).

### GitHub Actions

При пуше в `main/master` или создании тега автоматически собирается и публикуется Docker-образ в GHCR:

```
ghcr.io/<username>/<repository>:latest
```

Подробная инструкция по развёртыванию доступна в [`DEPLOY.md`](./DEPLOY.md).

---

## Контакты и поддержка

Проект готов к продолжению разработки. Все необходимые компоненты созданы и протестированы.

**Для продолжения работы:**
1. Изучите структуру проекта
2. Проверьте интеграцию с backend
3. Реализуйте недостающий функционал из списка задач
4. Добавьте тесты для критичных компонентов
