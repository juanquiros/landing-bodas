# Backend, formularios y administración

## Arquitectura

La landing se compila como una aplicación Next.js standalone y se ejecuta con Node.js en el puerto interno `3000`. Los formularios llaman a Route Handlers de Next; el servidor valida, comprueba Cloudflare Turnstile y recién entonces escribe mediante Drizzle en SQLite. La aplicación no necesita Workers, D1 ni otro servicio de base de datos.

La boda activa se identifica con `wedding.slug` en `config/wedding.ts`. Tanto confirmaciones como canciones guardan ese valor, por lo que el modelo queda preparado para separar eventos.

## SQLite y migraciones

- Desarrollo: `DATABASE_PATH=./data/wedding.db`.
- Docker: `DATABASE_PATH=/app/data/wedding.db`.
- Volumen Compose: `wedding_data`, montado en `/app/data`.
- Tablas: `rsvps` y `song_requests`.
- Ajustes: WAL, claves foráneas y `busy_timeout=5000`.

El directorio de la base se crea automáticamente. Las migraciones versionadas están en `drizzle/` y se aplican antes de iniciar el servidor. Para ejecutarlas manualmente:

```bash
npm run db:migrate
```

Las migraciones no eliminan registros ni reinician la base.

## Variables de entorno

Copiar `.env.example` a `.env` y reemplazar todos los valores de ejemplo:

```dotenv
DATABASE_PATH=/app/data/wedding.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=una-clave-larga-y-unica
ADMIN_SESSION_SECRET=un-secreto-aleatorio-de-al-menos-32-caracteres
NEXT_PUBLIC_TURNSTILE_SITE_KEY=clave-publica-del-widget
TURNSTILE_SECRET_KEY=clave-secreta-del-servidor
TURNSTILE_DEV_BYPASS=false
```

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` es pública y se incorpora al bundle durante el build. Si cambia, hay que reconstruir la imagen. Las demás variables son sólo de servidor. Nunca se debe versionar `.env`.

Para desarrollo local se puede activar `TURNSTILE_DEV_BYPASS=true`; el backend lo ignora siempre que `NODE_ENV=production`.

## Formularios y antispam

- `POST /api/rsvp`: valida y guarda confirmaciones.
- `POST /api/song-requests`: valida y guarda canciones.
- `GET /api/song-requests/public`: devuelve como máximo cinco canciones y únicamente `title` y `artist`.

Ambos POST usan Zod, un honeypot invisible y validación server-side contra Siteverify de Cloudflare. Un token ausente o inválido nunca llega a SQLite. No existe un GET público de confirmaciones.

## Administración

El ingreso está en `/admin/login`. Usuario, contraseña y secreto de sesión vienen exclusivamente del entorno. Un login correcto crea una cookie HMAC SHA-256 `HttpOnly`, `SameSite=Strict`, `Path=/`, segura en producción y válida por ocho horas.

`/admin` muestra totales, filtros y búsquedas sobre confirmaciones, canciones y personas que realmente asisten. `POST /api/admin/logout` cierra la sesión. `GET /api/admin/report.pdf` genera el reporte completo en el servidor y responde `401` sin una sesión válida.

## PDF

El botón **DESCARGAR REPORTE PDF** genera un archivo real con cabecera, resumen, confirmaciones, canciones, texto ajustado, páginas adicionales y numeración. Las fechas se muestran con locale `es-AR` y zona `America/Argentina/Buenos_Aires`.

## Docker y despliegue

En el VPS, desde la carpeta del proyecto:

```bash
git pull --ff-only origin master
test -f .env || cp .env.example .env
nano .env
NPM_NETWORK=proxy docker compose -f docker-compose.yml -f docker-compose.npm.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.npm.yml ps
curl -I http://127.0.0.1:3107/
```

En Nginx Proxy Manager el destino es `http://karina-y-mario-landing:3000`. El dominio público actual es `marcelo-y-karina.impulsodigitalmisiones.com.ar`. La red externa `proxy` debe ser la misma a la que está conectado Nginx Proxy Manager.

## Backup y restauración

La fuente persistente es `/app/data/wedding.db`. Para obtener una copia consistente, detener brevemente sólo la aplicación, copiar la base y volver a levantarla:

```bash
cd /opt/apps/bodas/karina-y-mario
export NPM_NETWORK=proxy
mkdir -p backups
docker compose -f docker-compose.yml -f docker-compose.npm.yml stop landing
docker cp karina-y-mario-landing:/app/data/wedding.db "backups/wedding-$(date +%F-%H%M%S).db"
docker compose -f docker-compose.yml -f docker-compose.npm.yml up -d
```

Para restaurar una copia, conservar primero un backup del estado actual y luego:

```bash
cd /opt/apps/bodas/karina-y-mario
export NPM_NETWORK=proxy
docker compose -f docker-compose.yml -f docker-compose.npm.yml stop landing
docker cp backups/wedding-AAAA-MM-DD-HHMMSS.db karina-y-mario-landing:/app/data/wedding.db
docker compose -f docker-compose.yml -f docker-compose.npm.yml start landing
docker compose -f docker-compose.yml -f docker-compose.npm.yml logs --tail=100 landing
```

No usar `docker compose down -v`: la opción `-v` elimina el volumen y sus datos. Un `docker compose down` normal, un reinicio o un rebuild conservan `wedding_data`.
