# Despliegue en VPS con Docker y Nginx

Esta app se ejecuta en un contenedor y publica el puerto interno `3107` únicamente en `127.0.0.1`. Nginx es el único servicio expuesto a internet y gestiona HTTPS para `karina-y-mario.impulsodigitalmisiones.com.ar`. Esto permite convivir con otros sitios y contenedores en el mismo VPS.

## 1. DNS y requisitos

Creá un registro `A` para `karina-y-mario.impulsodigitalmisiones.com.ar` apuntando a la IP pública del VPS. Abrí los puertos `80` y `443` en el firewall. En el servidor deben estar instalados Docker Compose, Nginx y Certbot con el plugin de Nginx.

## 2. Levantar la app

Cloná o actualizá este repositorio en el VPS y, desde su raíz, ejecutá:

```bash
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:3107
```

El último comando debe devolver una respuesta HTTP. La app no queda publicada directamente a internet.

## 3. Emitir el certificado

Mientras todavía no exista el certificado, habilitá temporalmente este bloque HTTP en Nginx:

```nginx
server {
    listen 80;
    server_name karina-y-mario.impulsodigitalmisiones.com.ar;
    location / { proxy_pass http://127.0.0.1:3107; }
}
```

Guardalo en `/etc/nginx/sites-available/karina-y-mario.impulsodigitalmisiones.com.ar`, creá el enlace y validá Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/karina-y-mario.impulsodigitalmisiones.com.ar /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d karina-y-mario.impulsodigitalmisiones.com.ar
```

## 4. Activar la configuración final

Copiá [la configuración incluida](../deploy/nginx/karina-y-mario.impulsodigitalmisiones.com.ar.conf) sobre ese archivo, validá y recargá Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Probá `https://karina-y-mario.impulsodigitalmisiones.com.ar` y verificá la renovación automática:

```bash
sudo certbot renew --dry-run
```

## Actualizaciones

Después de hacer `git pull`, reconstruí sin cambiar la URL ni la configuración de Nginx:

```bash
docker compose up -d --build
docker image prune -f
```

Para consultar fallos de la app: `docker compose logs -f landing`.
