# Guía de Despliegue Paso a Paso

Sigue estos pasos exactos para subir tu código al nuevo GitHub y desplegarlo en Vercel.

## 1. Preparar el repositorio local (En tu terminal)

Para evitar conflictos con tu cuenta anterior de GitHub, vamos a reiniciar la configuración de git localmente.

Abre la terminal en la carpeta del proyecto y ejecuta estos comandos uno por uno:

```bash
# 1. Borrar la configuración de git anterior (para empezar limpio)
rm -rf .git

# 2. Inicializar nuevo repositorio
git init

# 3. Preparar todos los archivos para subida
git add .

# 4. Guardar los cambios
git commit -m "Lanzamiento inicial Dashboard Belisario v1.0"

# 5. Nombrar la rama principal como 'main'
git branch -M main
```

## 2. Conectar con tu nuevo GitHub

Asegúrate de haber creado el repositorio en la página web (botón verde "Create repository" en la pantalla que me mostraste).

Luego, ejecuta este comando para enlazar tu carpeta local con el repositorio en la nube:

```bash
# Conectar al repositorio remoto
git remote add origin https://github.com/camilom340-dot/DASHBOARD-BELISARIO.git

# Subir los archivos
git push -u origin main
```

> **Nota:** Si te pide usuario y contraseña, usa tu usuario `camilom340-dot` y tu contraseña (o Personal Access Token si tienes 2FA activado).

## 3. Desplegar en Vercel

Una vez que el código esté en GitHub:

1.  Ve a [vercel.com](https://vercel.com) e inicia sesión (puedes usar tu cuenta de GitHub).
2.  En el Dashboard de Vercel, haz clic en **"Add New..."** -> **"Project"**.
3.  Verás una lista de tus repositorios de GitHub. Busca **`DASHBOARD-BELISARIO`** y haz clic en **"Import"**.
4.  **Configuración del Proyecto:**
    *   **Framework Preset:** Next.js (debería detectarse automático).
    *   **Root Directory:** `./` (déjalo vacío o como está).
    *   **Environment Variables:** No necesitas configurar nada aquí porque tu app procesa el Excel en el navegador.
5.  Haz clic en **"Deploy"**.

Vercel tardará unos minutos construyendo el sitio. Cuando termine, te dará una URL (ej: `dashboard-belisario.vercel.app`) que podrás compartir con tu cliente.

---
**¡Listo!** Tu aplicación estará en línea.
