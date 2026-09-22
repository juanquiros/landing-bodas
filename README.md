# Karina & Marcelo - invitación digital

Landing de casamiento construida con Next.js, React y TypeScript. Producción corre como servidor Node.js standalone dentro de Docker. Las confirmaciones y canciones se guardan en SQLite local mediante better-sqlite3 y Drizzle ORM.

## Desarrollo

Requiere Node.js `>=22.13.0`.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

El servidor de desarrollo queda en `http://localhost:5173`. Para probar formularios sin un widget real se puede definir `TURNSTILE_DEV_BYPASS=true`; ese bypass nunca funciona bajo `NODE_ENV=production`.

## Comandos

- `npm run dev`: aplica migraciones y abre Next.js en modo desarrollo.
- `npm run build`: genera el build standalone de Next.js.
- `npm start`: aplica migraciones y abre el servidor Node de producción.
- `npm run db:generate`: genera migraciones Drizzle.
- `npm run db:migrate`: aplica migraciones pendientes sin borrar datos.
- `npm test`: ejecuta las pruebas del backend.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: valida TypeScript.

## Producción

Copiar `.env.example` a `.env`, configurar credenciales y Turnstile, y levantar:

```bash
docker compose up -d --build
```

La base productiva vive en `/app/data/wedding.db` dentro del volumen persistente `wedding_data`. La aplicación no depende de Cloudflare Workers ni D1; Cloudflare sólo se usa para DNS y Turnstile.

La arquitectura, el panel, el reporte PDF, el backup y el despliegue con Nginx Proxy Manager están documentados en [docs/ADMIN_AND_FORMS.md](docs/ADMIN_AND_FORMS.md).
