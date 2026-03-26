# Feedback Board — Платформа для сбора и управления обратной связью

Система управления обратной связью, предназначенная для сбора, организации и приоритизации пользовательских предложений. Проект реализован на стеке Next.js, React и PocketBase, поддерживает многопользовательские рабочие пространства (workspaces), древовидные обсуждения и систему голосования.

**Демонстрационная версия**: `http://localhost:3000`
**Панель администратора PocketBase**: `http://127.0.0.1:8090/_/`

---

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Основные возможности](#основные-возможности)
- [Роли и права доступа](#роли-и-права-доступа)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Пользовательские сценарии](#пользовательские-сценарии)
- [Установка и запуск](#установка-и-запуск)
- [Конфигурация](#конфигурация)
- [Структура базы данных](#структура-базы-данных)
- [Диаграмма связей БД](#диаграмма-связей-бд)
- [UML диаграмма системы](#uml-диаграмма-системы)
- [API маршруты](#api-маршруты)
- [Row-Level Security (RLS)](#row-level-security-rls)
- [Безопасность](#безопасность)

---

## Быстрый старт

Процедура первичной настройки и запуска:

```bash
# 1. Клонирование репозитория
git clone https://github.com/TomatoJami/Feedback-Board.git
cd Feedback-Board

# 2. Установка зависимостей
npm install

# 3. Настройка PocketBase
# Скачайте исполняемый файл PocketBase с официального сайта (https://pocketbase.io/docs/)
# Разместите его в корне проекта или в отдельной директории.
# Импортируйте схему из файла pb-schema.json через панель администратора.

# 4. Запуск PocketBase (в отдельном терминале)
./pocketbase serve

# 5. Запуск фронтенда
npm run dev
```

После запуска приложение будет доступно по адресу http://localhost:3000. В административном интерфейсе можно:
- Настроить рабочее пространство (workspace).
- Управлять предложениями (suggestions) и категориями.
- Модерировать обсуждения.

---

## Основные возможности

### Изолированные рабочие пространства (Multi-Tenant Workspaces)
- Каждая организация работает в выделенном пространстве.
- Настраиваемые URL-адреса (слаги).
- Управление участниками с разграничением ролей.
- Поддержка публичных и приватных пространств.

### Система предложений и голосования
- Создание и редактирование идей с поддержкой Markdown.
- Категоризация предложений.
- Управление жизненным циклом идеи через статусы (Open, In Progress, Completed и др.).
- Система оценки (Upvote/Downvote) с автоматическим расчетом популярности.

### Обсуждения
- Многоуровневые комментарии.
- Система уведомлений в реальном времени.
- Поддержка Markdown в комментариях с предпросмотром.

### Панель управления (Admin Dashboard)
- Мониторинг ключевых метрик.
- Управление категориями, статусами и пользователями.
- Инструменты модерации контента.
- Объединение (merge) дублирующих предложений.

---

## Роли и права доступа

Система разделяет права доступа на два уровня: глобальный (сайт) и локальный (рабочее пространство).

### Глобальные роли
- **Глобальный администратор (Site Admin)**: Пользователь с ролью `admin` в системе. Имеет неограниченный доступ ко всем рабочим пространствам, пользователям и настройкам системы.
- **Пользователь (User)**: Обычный зарегистрированный пользователь системы.

### Роли внутри рабочего пространства (Workspace Roles)
- **Владелец (Owner)**: Пользователь, создавший пространство. Обладает полными правами управления пространством, включая его удаление.
- **Администратор (Admin)**: Назначаемая роль. Позволяет управлять категориями, статусами, приглашать участников и модерировать любые предложения.
- **Модератор (Moderator)**: Имеет доступ к инструментам модерации контента (редактирование и удаление чужих предложений/комментариев).
- **Участник (Member)**: Может создавать предложения, голосовать и оставлять комментарии внутри пространства.

---

## Технологический стек

### Фронтенд
| Технология | Назначение |
|-----------|-----------|
| **Next.js 16.1.7** | Full-stack фреймворк (App Router) |
| **React 19.2.3** | Библиотека пользовательского интерфейса |
| **TypeScript 5.x** | Статическая типизация |
| **Tailwind CSS 4.x** | Стилизация |
| **React Hot Toast** | Уведомления |

### Бэкенд и база данных
| Технология | Назначение |
|-----------|-----------|
| **PocketBase 0.25.0** | Backend-as-a-Service (API, Auth, SQLite) |

### Инфраструктура
| Инструмент | Назначение |
|-----------|-----------|
| **Coolify** | Деплоймент |
| **Zabbix / Dozzle** | Мониторинг и логирование |

---

## Структура проекта

```
feedback-board/
├── README.md - Основной файл документации
├── pb-schema.json - Схема базы данных PocketBase
├── package.json - Зависимости и скрипты
├── tsconfig.json - Конфигурация TypeScript
├── next.config.ts - Конфигурация Next.js
├── eslint.config.mjs - Конфигурация ESLint
├── postcss.config.mjs - Конфигурация PostCSS
├── proxy.ts - Вспомогательный прокси-сервер
│
├── 📁 app/ ← Next.js App Router (Маршрутизация)
│ ├── 📄 layout.tsx ← Корневой макет
│ ├── 📄 page.tsx ← Главная страница
│ ├── 📁 admin/ ← Панель администрирования
│ ├── 📁 api/ ← Обработчики API (Stripe, Merge и др.)
│ ├── 📁 auth/ ← Маршруты аутентификации
│ ├── 📁 create-workspace/ ← Создание рабочих пространств
│ ├── 📁 w/[workspaceId]/ ← Управление конкретным пространством
│ └── ...
│
├── 📁 components/ ← React-компоненты
│ ├── 📁 admin/ ← Компоненты панели администратора
│ ├── 📁 ui/ ← Базовые UI-компоненты
│ ├── 📁 suggestions/ ← Работа с предложениями
│ └── ...
│
├── 📁 hooks/ ← Пользовательские React-хуки
│ ├── useAuth.ts ← Контекст авторизации
│ ├── useAdmin.ts ← Логика администрирования
│ └── ...
│
├── 📁 lib/ ← Утилиты и сервисы
│ ├── pocketbase.ts ← Клиент PocketBase
│ └── 📁 services/ ← Инкапсуляция логики API
│
└── 📁 public/ ← Статические ресурсы
```

---

## Пользовательские сценарии

### 1. Онбординг (Onboarding)
- Регистрация → Подтверждение Email → Авторизация.
- Создание личного или корпоративного рабочего пространства.
- Настройка первичных категорий и статусов для сбора обратной связи.

### 2. Взаимодействие (Engagement)
- Публикация идей и предложений.
- Обсуждение в комментариях и голосование за приоритетные задачи.
- Получение уведомлений об изменении статуса предложений.

### 3. Управление (Management)
- Модерация входящего потока идей.
- Назначение исполнителей на конкретные предложения.
- Объединение дублирующихся идей для консолидации голосов.
- Анализ популярности фич через метрики.

---

## Установка и запуск

### Системные требования
- **Node.js**: версия 20 или выше.
- **npm**: версия 9 или выше.
- **PocketBase**: версия 0.25.0 или выше.

---

## Конфигурация

### Переменные окружения (`.env.local`)

```env
NEXT_PUBLIC_POCKETBASE_URL=http://pocketbase
STRIPE_SECRET_KEY=sk_test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test
STRIPE_WEBHOOK_SECRET=whsec
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_
PB_ADMIN_EMAIL=example@example.com
PB_ADMIN_PASSWORD=password
```

---

## Структура базы данных

### Коллекция `users` (Пользователи)
| Поле | Тип | Описание |
|------|-----|----------|
| **email** | Email | Уникальный адрес пользователя |
| **name** | Text | Отображаемое имя |
| **avatar** | File | Изображение профиля |
| **role** | Select | Глобальная роль: `user`, `admin` |
| **plan** | Select | Тарифный план: `free`, `pro` |
| **status** | Select | Статус аккаунта: `active`, `blocked` |
| **stripe_customer_id** | Text | ID клиента в Stripe |
| **stripe_subscription_id** | Text | ID подписки в Stripe |
| **stripe_price_id** | Text | ID цены в Stripe |
| **stripe_current_period_end** | Date | Дата окончания текущего периода подписки |

### Коллекция `workspaces` (Рабочие пространства)
| Поле | Тип | Описание |
|------|-----|----------|
| **name** | Text | Название пространства |
| **slug** | Text | Уникальный идентификатор в URL |
| **owner** | Relation | Ссылка на владельца (users) |
| **isPrivate** | Bool | Флаг приватности пространства |
| **is_frozen** | Bool | Приостановка активности (заморозка) |

### Коллекция `workspace_members` (Участники)
| Поле | Тип | Описание |
|------|-----|----------|
| **workspace** | Relation | Ссылка на рабочее пространство |
| **user** | Relation | Ссылка на пользователя |
| **role** | Select | Роль в пространстве: `admin`, `moderator`, `user` |
| **prefixes** | Relation | Список префиксов пользователя (user_prefixes) |

### Коллекция `suggestions` (Предложения)
| Поле | Тип | Описание |
|------|-----|----------|
| **title** | Text | Заголовок идеи |
| **description** | Editor | Подробное описание (HTML) |
| **image** | File | Изображение предложения |
| **category_id** | Relation | Категория (categories) |
| **status_id** | Relation | Текущий статус (statuses) |
| **author** | Relation | Автор идеи (users) |
| **workspace_id** | Relation | Ссылка на рабочее пространство |
| **is_public** | Bool | Видимо ли предложение публично |
| **votes_count** | Number | Количество набранных голосов |
| **pinned** | Bool | Закреплено ли предложение сверху |
| **merged_into** | Relation | Ссылка на основную идею (при объединении) |

### Коллекция `comments` (Комментарии)
| Поле | Тип | Описание |
|------|-----|----------|
| **text** | Text | Текст комментария |
| **user** | Relation | Автор (users) |
| **suggestion** | Relation | Ссылка на предложение |
| **parent_id** | Relation | Ссылка на родительский комментарий (для веток) |
| **upvotes** | Number | Количество голосов за комментарий |
| **downvotes** | Number | Количество голосов против комментария |
| **workspace_id** | Relation | Ссылка на рабочее пространство |
| **merged_from_suggestion** | Text | ID предложения, указанного при объединении комментариев |

### Коллекция `categories` (Категории)
| Поле | Тип | Описание |
|------|-----|----------|
| **name** | Text | Название категории |
| **icon** | Text | Иконка/символ категории |
| **workspace_id** | Relation | Ссылка на рабочее пространство |

### Коллекция `statuses` (Статусы)
| Поле | Тип | Описание |
|------|-----|----------|
| **name** | Text | Название статуса |
| **color** | Text | Цвет статуса |
| **workspace_id** | Relation | Ссылка на рабочее пространство |

### Коллекция `votes` (Голосование за предложения)
| Поле | Тип | Описание |
|------|-----|----------|
| **user** | Relation | Ссылка на пользователя |
| **suggestion** | Relation | Ссылка на предложение |
| **type** | Select | Тип голоса: `upvote`, `downvote` |

### Коллекция `notifications` (Уведомления)
| Поле | Тип | Описание |
|------|-----|----------|
| **user** | Relation | Ссылка на пользователя |
| **message** | Text | Текст уведомления |
| **link** | Text | Ссылка для перехода |
| **read** | Bool | Прочитано ли уведомление |
| **type** | Select | Тип уведомления: `comment`, `vote`, `status`, `merge`, `system` |

### Коллекция `user_prefixes` (Префиксы пользователей)
| Поле | Тип | Описание |
|------|-----|----------|
| **name** | Text | Название префикса/тега |
| **color** | Text | Цвет префикса (hex-код) |
| **workspace_id** | Relation | Ссылка на рабочее пространство |

### Коллекция `settings` (Конфигурация)
| Поле | Тип | Описание |
|------|-----|----------|
| **workspace_id** | Relation | Ссылка на рабочее пространство |
| **default_status** | Relation | Статус по умолчанию |
| **deletable_statuses** | Relation | Список удаляемых статусов |

### Коллекция `logs` (Логирование)
| Поле | Тип | Описание |
|------|-----|----------|
| **user_id** | Relation | Ссылка на пользователя (если применимо) |
| **error_message** | Text | Текст сообщения об ошибке |
| **stack_trace** | Text | Трассировка стека ошибки |
| **path** | Text | Путь (маршрут) где произошла ошибка |

### Коллекция `comment_votes` (Голосование за комментарии)
| Поле | Тип | Описание |
|------|-----|----------|
| **user** | Relation | Ссылка на пользователя |
| **comment** | Relation | Ссылка на комментарий |
| **type** | Select | Тип голоса: `upvote`, `downvote` |

### Описание классов

- **User**: Пользователь системы с автентификацией и интеграцией Stripe
- **Workspace**: Отделенное рабочее пространство с отдельными предложениями и ̾чсленными
- **WorkspaceMember**: Мембер рабочего пространства с ролью и префиксами
- **Suggestion**: Предложение/идея со всемо метадатой
- **Comment**: Комментарий на предложение с поддержкой веток
- **Category**: Категория для классификации предложений
- **Status**: Статус на жизненном цикле предложения
- **Vote**: Голос за предложение (upvote/downvote)
- **CommentVote**: Голос за комментарий
- **Notification**: Уведомление пользователю
- **UserPrefix**: Префикс/тег для отмечания пользователей
- **Settings**: Настройки рабочего пространства
- **Log**: Системные логи и ошибки

---

## API маршруты

### Authentication (Аутентификация)

#### Регистрация
```bash
# POST /api/collections/users/records
curl -X POST http://localhost:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "passwordConfirm": "password",
    "name": "John Doe"
  }'
```

#### Логин
```bash
# POST /api/collections/users/auth-with-password
curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "user@example.com",
    "password": "password"
  }'
```

Ответ содержит `token` и `record` (данные пользователя).

#### Логаут
```bash
curl -X POST http://localhost:8090/api/collections/users/auth-refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Workspaces (Рабочие пространства)

#### Создать рабочее пространство
```bash
# POST /api/collections/workspaces/records
curl -X POST http://localhost:8090/api/collections/workspaces/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Workspace",
    "slug": "my-workspace",
    "isPrivate": false,
    "owner": "USER_ID"
  }'
```

#### Получить все рабочие пространства
```bash
# GET /api/collections/workspaces/records
curl http://localhost:8090/api/collections/workspaces/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Получить одно рабочее пространство
```bash
# GET /api/collections/workspaces/records/WORKSPACE_ID
curl http://localhost:8090/api/collections/workspaces/records/WORKSPACE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Обновить рабочее пространство
```bash
# PATCH /api/collections/workspaces/records/WORKSPACE_ID
curl -X PATCH http://localhost:8090/api/collections/workspaces/records/WORKSPACE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Name",
    "is_frozen": true
  }'
```

### Suggestions (Предложения)

#### Создать предложение
```bash
# POST /api/collections/suggestions/records
curl -X POST http://localhost:8090/api/collections/suggestions/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Add dark mode",
    "description": "<p>Please add a dark mode option</p>",
    "workspace_id": "WORKSPACE_ID",
    "category_id": "CATEGORY_ID",
    "author": "USER_ID",
    "is_public": true
  }'
```

#### Получить предложения рабочего пространства
```bash
# GET /api/collections/suggestions/records?filter=workspace_id="WORKSPACE_ID"
curl "http://localhost:8090/api/collections/suggestions/records?filter=workspace_id=\"WORKSPACE_ID\"" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Обновить предложение
```bash
# PATCH /api/collections/suggestions/records/SUGGESTION_ID
curl -X PATCH http://localhost:8090/api/collections/suggestions/records/SUGGESTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status_id": "NEW_STATUS_ID",
    "votes_count": 5
  }'
```

### Comments (Комментарии)

#### Создать комментарий
```bash
# POST /api/collections/comments/records
curl -X POST http://localhost:8090/api/collections/comments/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Great idea!",
    "suggestion": "SUGGESTION_ID",
    "user": "USER_ID",
    "workspace_id": "WORKSPACE_ID"
  }'
```

#### Ответить на комментарий
```bash
# POST /api/collections/comments/records
curl -X POST http://localhost:8090/api/collections/comments/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "I agree!",
    "suggestion": "SUGGESTION_ID",
    "user": "USER_ID",
    "parent_id": "PARENT_COMMENT_ID",
    "workspace_id": "WORKSPACE_ID"
  }'
```

### Votes (Голосование)

#### Голосовать за предложение
```bash
# POST /api/collections/votes/records
curl -X POST http://localhost:8090/api/collections/votes/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user": "USER_ID",
    "suggestion": "SUGGESTION_ID",
    "type": "upvote"
  }'
```

#### Голосовать за комментарий
```bash
# POST /api/collections/comment_votes/records
curl -X POST http://localhost:8090/api/collections/comment_votes/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user": "USER_ID",
    "comment": "COMMENT_ID",
    "type": "upvote"
  }'
```

### Categories & Statuses (Категории и Статусы)

#### Получить категории
```bash
# GET /api/collections/categories/records?filter=workspace_id="WORKSPACE_ID"
curl "http://localhost:8090/api/collections/categories/records?filter=workspace_id=\"WORKSPACE_ID\"" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Создать категорию
```bash
# POST /api/collections/categories/records
curl -X POST http://localhost:8090/api/collections/categories/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Feature Requests",
    "icon": "💡",
    "workspace_id": "WORKSPACE_ID"
  }'
```

#### Получить статусы
```bash
# GET /api/collections/statuses/records?filter=workspace_id="WORKSPACE_ID"
curl "http://localhost:8090/api/collections/statuses/records?filter=workspace_id=\"WORKSPACE_ID\"" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Notifications (Уведомления)

#### Получить уведомления пользователя
```bash
# GET /api/collections/notifications/records?filter=user="USER_ID"
curl "http://localhost:8090/api/collections/notifications/records?filter=user=\"USER_ID\"" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Отметить уведомление как прочитанное
```bash
# PATCH /api/collections/notifications/records/NOTIFICATION_ID
curl -X PATCH http://localhost:8090/api/collections/notifications/records/NOTIFICATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "read": true
  }'
```

---

## Row-Level Security (RLS)

Полный набор правил доступа для каждой коллекции.

### Users
- **List**: Пользователи видят друг друга, если не заблокированы
- **View**: Видеть могут аутентифицированные незаблокированные пользователи
- **Create**: Только регистрация (public)
- **Update**: Сам пользователь, глобальный админ, админы/модераторы других рабочих пространств
- **Delete**: Сам пользователь или глобальный админ

### Workspaces
- **List/View**: Владелец, участники, глобальный админ, публичные пространства
- **Create**: Любой аутентифицированный пользователь
- **Update/Delete**: Только владелец или глобальный админ

### Suggestions
- **List/View**: Публичные предложения или если пользователь участник рабочего пространства
- **Create**: Аутентифицированный пользователь в незамороженном пространстве
- **Update**: Автор, владелец рабочего пространства, админ/модератор
- **Delete**: Автор (если статус Open), владелец, админ/модератор, глобальный админ

### Comments
- **List/View**: Если не заблокирован пользователь
- **Create**: Автор комментария создает его сам
- **Update**: Автор, владелец рабочего пространства, админ/модератор
- **Delete**: Автор, владелец, админ/модератор, глобальный админ

### Votes
- **List/View**: Только аутентифицированные незаблокированные пользователи
- **Create**: Пользователь голосует сам и не является автором предложения
- **Delete**: Пользователь удаляет свой голос

### Comment Votes
- **List/View**: Все видят
- **Create**: Пользователь голосует и не является автором комментария
- **Update/Delete**: Пользователь удаляет свой голос

### Categories & Statuses
- **Create**: Аутентифицированный пользователь
- **Update/Delete**: Владелец рабочего пространства, админ, глобальный админ

### Workspace Members
- **List**: Владелец, участники, админ, глобальный админ
- **Create**: Владелец, админ, модератор, глобальный админ
- **Update/Delete**: Владелец, админ, модератор, глобальный админ

### Notifications
- **List/View**: Только владелец уведомления
- **Update**: Владелец может отметить как прочитанное
- **Delete**: Владелец нотификации

### Settings
- **Update/Delete**: Владелец рабочего пространства, админ, глобальный админ

### Logs
- **List/View/Delete**: Только глобальный админ (логи система)

---

## Безопасность

### Row-Level Security (RLS)
Изоляция данных реализована на уровне API PocketBase через фильтры доступа (Rules):
- Пользователи имеют доступ только к контенту тех `workspaces`, в которых они состоят или которые являются публичными.
- Модификация ресурсов (категории, статусы, чужие предложения) разрешена только пользователям с соответствующими ролями (`admin`, `moderator`, `owner`).
- Дополнительная валидация данных происходит на стороне клиента через схемы Zod.

---

## Поддержка и лицензия

При возникновении проблем создавайте Issue в репозитории проекта.

**Лицензия**: MIT.