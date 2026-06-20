# Surf Portugal 🌊

PWA для прогноза серфинга на пляжах Португалии.

**Данные:** Open-Meteo (волны + погода, без ключа)
**183 пляжа** — от Назаре до Алгарве, с поиском, избранным и surf score 0–10.

## Запуск локально

```bash
npm install
npm run dev
```

## Деплой

Build output: `dist/` · Build command: `npm run build`

- **Vercel**: `vercel.json` уже есть, подключи репо — всё автоматически.
- **Cloudflare Pages**: `public/_redirects` уже есть для SPA-fallback.
