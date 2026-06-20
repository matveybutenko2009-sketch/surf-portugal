# Surf Portugal 🌊

PWA для прогноза серфинга на пляжах Португалии.

**Данные:** Open-Meteo (волны + погода) · beachcam.pt (камеры) · WorldTides (приливы, опционально)  
**183 пляжа** — от Назаре до Алгарве, с поиском, избранным и surf score 0–10.

## Запуск локально

```bash
npm install
npm run dev
```

## Переменные окружения

Скопируй `.env.example` → `.env` и вставь ключи:

| Переменная | Описание |
|---|---|
| `VITE_TIDE_API_KEY` | WorldTides API key (опционально, free tier) |

> `VITE_`-переменные попадают в публичный бандл — не кладите туда секреты.

## Деплой

Build output: `dist/`  
Build command: `npm run build`

- **Vercel**: подключи репо, настройки по умолчанию подойдут (`vercel.json` уже есть).  
- **Cloudflare Pages**: `public/_redirects` уже есть для SPA-fallback.
