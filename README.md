<p align="center">
  <a href="https://aizberg.ru"><img src="docs/images/logo.svg" alt="Aizberg" width="220"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="Лицензия GPL-3.0">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-2-646CFF" alt="Vite 2">
  <img src="https://img.shields.io/badge/TypeScript-4-3178C6" alt="TypeScript 4">
</p>

# Aizberg-front

**Aizberg-front — панель управления платформы для интернет-магазинов Aizberg.** Каталог, заказы, покупатели, доставка и настройки магазина — в одном веб-интерфейсе.

> **Этот репозиторий — только панель управления.** Сама она данных не хранит и работает через HTTP API бэкенда: [github.com/robotovnet/Aizberg](https://github.com/robotovnet/Aizberg).

## Содержание

- [Возможности](#возможности)
- [Архитектура](#архитектура)
- [Быстрый старт](#быстрый-старт)
- [Конфигурация](#конфигурация)
- [Структура проекта](#структура-проекта)
- [Разработка разделов](#разработка-разделов)
- [Лицензия](#лицензия)

## Возможности

Каждый раздел панели работает с одним из модулей бэкенда.

| Область | Что есть | Разделы в `pages/dashboard` |
|---|---|---|
| Каталог | Товары и их фотографии, типы товаров, разделы и их порядок, плиточный каталог, характеристики, фильтры, бренды, SEO разделов, перенос значений характеристик | `products`, `product-types`, `catalog-sections`, `tiled-catalog`, `features`, `catalog-filters`, `brands`, `seo-catalog`, `product-parameter-migration`, `products-by-parameter` |
| Продажи | Заказы, заказы в один клик, вопросы покупателей, бонусная программа, отчёт по продажам | `sales/orders`, `sales/one-click-order`, `sections-one-click-order`, `sales/qa`, `bonus-program`, `reports/total-sales` |
| Доставка и оплата | Транспортные компании и тарифы, города курьерской доставки, пункты выдачи, постаматы, склады, способы оплаты | `transport-companies`, `delivery-cities`, `pickup-points`, `postamats`, `warehouses`, `payment-methods` |
| Магазины и города | Магазины, города, страны, валюты, типы цен, сервисные центры | `shops`, `cities`, `countries`, `currencies`, `price-types`, `service-centers` |
| Покупатели и персонал | Покупатели и типы клиентов, сотрудники, группы и права доступа, профиль сотрудника | `sales/clients`, `client-types`, `staff`, `staff-groups`, `profile` |
| Контент | Текстовые материалы и страницы, изображения, витрина сайтов на Aizberg | `materials`, `catalog-images`, `real-projects` |
| Маркетинг | YML-выгрузки для торговых площадок, статистика Яндекс Вордстат, розыгрыши | `yml`, `yandex-wordstat`, `lottery` |
| Служебное | Системные настройки и настройки модулей, типы матриц | `settings`, `modules/settings`, `matrix-types` |

Интерфейс переведён на русский и английский языки.

## Архитектура

Панель — приложение на Vue 3 с серверным рендерингом.

| Часть | Назначение |
|---|---|
| Сервер Express ([server/index.ts](server/index.ts)) | Отдаёт страницы и статические файлы по HTTP, а при наличии сертификатов — и по HTTPS |
| [vite-plugin-ssr](https://github.com/brillout/vite-plugin-ssr) | Серверный рендеринг и файловая маршрутизация: адрес страницы определяется её путём в `pages/` |
| Vue 3, Vuex, vue-i18n | Интерфейс, состояние и переводы |
| axios | Запросы к API |

Как панель работает с бэкендом:

- **Запросы из браузера** идут напрямую в API по адресу `VITE_API_URL` и передают cookie сессии Laravel.
- **Вход.** После входа панель сохраняет идентификатор сессии в cookie `session_id`. При каждом серверном рендеринге она проверяет его запросом `staff/session/{id}` по адресу `VITE_DOCKER_API_URL` и без действующей сессии перенаправляет на страницу входа.
- **Меню и права.** Пункты меню, права сотрудника и правила валидации форм панель получает из API, поэтому состав разделов зависит от включённых модулей бэкенда и прав группы сотрудника.

## Быстрый старт

### Требования

- Node.js 16 или новее и npm.
- Запущенный бэкенд [Aizberg](https://github.com/robotovnet/Aizberg) — без него в панель нельзя войти.

### Установка

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/robotovnet/Aizberg-front.git
   cd Aizberg-front
   ```

2. Создайте файл окружения и заполните его (см. [Конфигурация](#конфигурация)):

   ```bash
   cp .env.example .env
   ```

3. Установите зависимости:

   ```bash
   npm ci
   ```

4. Запустите панель в режиме разработки:

   ```bash
   npm run dev
   ```

   Панель откроется на `http://localhost:8080`.

### Запуск в production

```bash
npm run build
npm start
```

Сервер слушает порт `PORT`, а если найдены сертификаты — ещё и `HTTPS_PORT`. Команда `npm run prod` выполняет сборку и запуск за один шаг.

Для запуска под [PM2](https://pm2.keymetrics.io) в репозитории есть [ecosystem.config.js](ecosystem.config.js):

```bash
pm2 start ecosystem.config.js
```

Команда `npm run deploy` обновляет код из git, пересобирает панель и перезапускает её в PM2.

### Запуск в составе Aizberg

Бэкенд собирает панель из исходников сам: за это отвечает сервис `cp` в его `docker-compose.yml`.

1. Клонируйте панель рядом с бэкендом — в `/srv/Aizberg-front`.
2. Создайте `/srv/Aizberg-front/.env` из `.env.example`. Значение `PORT=8085` не меняйте: на этот порт проксирует запросы Nginx бэкенда.
3. Соберите и запустите контейнеры бэкенда:

   ```bash
   cd /srv/Aizberg
   docker compose up -d --build
   ```

Панель будет доступна на порту `CP_PORT` бэкенда (по умолчанию `8443`).

Переменные `VITE_*` попадают в код при сборке. После их изменения пересоберите панель: `docker compose up -d --build cp`.

### Первый вход

Учётную запись сотрудника с полными правами создаёт бэкенд в окружениях разработки и тестирования — см. раздел [«Первый вход»](https://github.com/robotovnet/Aizberg#первый-вход) в его README.

### HTTPS

Сервер запускает HTTPS, если находит сертификат и ключ. По умолчанию он ищет их в `server/ssl/server.cert` и `server/ssl/server.key`; другие пути задаются переменными `SSL_CERT_PATH`, `SSL_KEY_PATH` и `SSL_CA_PATH`. Содержимое `server/ssl` в git не попадает.

## Конфигурация

Все настройки — в файле `.env`, образец — [.env.example](.env.example).

| Переменная | Назначение |
|---|---|
| `PORT` | Порт HTTP-сервера в production. По умолчанию `8080` |
| `HTTPS_PORT` | Порт HTTPS-сервера в production. По умолчанию `443` |
| `SSL_CERT_PATH`, `SSL_KEY_PATH`, `SSL_CA_PATH` | Пути к сертификату, ключу и цепочке сертификатов |
| `VITE_API_URL` | Публичный адрес API, к которому обращается браузер. Обязательно с `/` в конце |
| `VITE_DOCKER_API_URL` | Адрес API для запросов с сервера панели. В Docker Compose бэкенда — адрес контейнера Nginx, `http://webserver:8444`; при запуске вне Docker — тот же адрес, что и `VITE_API_URL` |
| `VITE_MANAGER_GROUP_ID` | Идентификатор группы сотрудников-менеджеров: из неё строится список менеджеров в фильтрах заказов и покупателей |
| `VITE_SHOW_LANGUAGE_SWITCHER` | `true` — показывать переключатель языка интерфейса |
| `VITE_MATRIX_SECTIONS` | Названия разделов каталога через запятую, для товаров которых доступны тип матрицы и выгрузка прайса для 1С. Если переменная пуста, эти функции скрыты |

В режиме разработки сервер всегда слушает порт `8080`, а для HTTPS — `443`; переменные `PORT` и `HTTPS_PORT` действуют только в production.

Панель обращается к двум внешним адресам: `cloudflare.com/cdn-cgi/trace` — чтобы определить страну пользователя, и `cdnjs.cloudflare.com` — чтобы загрузить текстовый редактор Jodit на страницах товаров и материалов.

## Структура проекта

```
├── pages/                  Страницы; путь к файлу определяет адрес страницы
│   ├── _default/           Каркас приложения: серверный и клиентский рендеринг, общий макет
│   ├── _components/        Общие компоненты и компоненты разделов
│   ├── dashboard/          Разделы панели
│   └── staff/              Вход, выход, восстановление пароля
├── services/               Запросы к API по разделам
├── network/                Клиент axios и обработка ошибок запросов
├── store/                  Vuex: профиль сотрудника, права, правила валидации
├── composables/            Общая логика страниц: права, удаление, валидация
├── localization/           Тексты интерфейса на русском и английском
├── middleware/             Проверка сессии при серверном рендеринге, cookie, определение страны
├── validation/             Проверка полей форм
├── server/index.ts         Сервер Express
├── assets/                 Стили Sass и изображения
├── ecosystem.config.js     Конфигурация PM2
└── .env.example
```

## Разработка разделов

Раздел панели — это страница в `pages/dashboard`, сервис с запросами к API и файл переводов.

```
pages/dashboard/example/
├── index.page.vue          Список — /dashboard/example
└── item.page.vue           Создание и редактирование — /dashboard/example/item
services/exampleService.ts  Запросы к API
localization/example.ts     Тексты на русском и английском
```

Что нужно знать:

- **Маршруты.** Файл `pages/dashboard/example/index.page.vue` открывается по адресу `/dashboard/example`. Для адресов с параметрами рядом со страницей кладётся файл `*.page.route.ts` — см. пример в [pages/dashboard/staff/edit](pages/dashboard/staff/edit).
- **Запросы к API.** Сервис оборачивает вызовы axios в `fetchApi` из [network/fetchEndpoint.ts](network/fetchEndpoint.ts): он разбирает ошибки API и передаёт их в обработчик страницы.
- **Права.** `usePageInit('example')` из [composables/pages/dashboard/usePageInit.ts](composables/pages/dashboard/usePageInit.ts) возвращает флаги `canView` и `canEdit` по правам сотрудника `example.view` и `example.management`. Сами права заводятся в бэкенде.
- **Переводы.** Файл переводов подключается к странице в [localization/translation.ts](localization/translation.ts).
- **Меню и навигация.** Пункт меню добавляется сидером `DashboardMenus` в модуле бэкенда. В панели раздел описывается в [pages/_navigationTree.ts](pages/_navigationTree.ts) и [pages/_components/FooterBreadcrumb.vue](pages/_components/FooterBreadcrumb.vue) — для «хлебных крошек», и в [pages/_components/_populateMenu.ts](pages/_components/_populateMenu.ts) — чтобы подсвечивался активный пункт меню.

Хорошие образцы для изучения — [brands](pages/dashboard/brands) (простой раздел со списком и формой) и [products](pages/dashboard/products) (большой раздел с фильтрами, фотографиями и модальными окнами).

Как устроены модули бэкенда, их права и пункты меню — в разделе [«Разработка модулей»](https://github.com/robotovnet/Aizberg#разработка-модулей) README бэкенда.

## Лицензия

Aizberg-front распространяется по лицензии [GNU General Public License v3.0](LICENSE).
