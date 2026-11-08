<div align="center">
  <img src=".github/banner.svg" alt="NEZU · IntentFlow Dashboard, panel administrativo del Intent Manager" width="100%">
</div>

# IntentFlow Dashboard

Panel administrativo del **Nezu Intent Manager**, el servicio que recibe intenciones, las traduce en comandos y las sincroniza con las placas y dispositivos del ecosistema NEZU. Desde este panel el operador ve el estado de las intenciones, administra placas, clientes, usuarios y suscripciones, revisa comandos y ajusta la configuración.

El backend (API en Django) es privado. Este repositorio contiene solo la interfaz.

## Secciones

| Ruta | Contenido |
|---|---|
| `/login` | Acceso |
| `/dashboard` | Resumen y actividad |
| `/dashboard/intents` | Intenciones y su estado |
| `/dashboard/boards` | Placas y dispositivos |
| `/dashboard/commands` | Comandos emitidos |
| `/dashboard/clients` | Clientes |
| `/dashboard/users` | Usuarios |
| `/dashboard/subscriptions` | Suscripciones |
| `/dashboard/settings` | Configuración |

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

Crea `.env.local` con la URL de la API. Si no se define, el panel usa el backend local por defecto:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

El panel queda en `http://localhost:3000`.

## Calidad y construcción

```bash
npm run lint     # ESLint
npm test         # Vitest
npm run build    # Next.js build
npm start        # sirve la build
```

## Despliegue

Optimizado para Vercel: importa el repositorio, Vercel detecta Next.js y solo hace falta definir `NEXT_PUBLIC_API_URL` con la URL pública del backend.

## Estructura

```text
src/
  app/            rutas (App Router): login y dashboard/*
  features/       funcionalidades por dominio
  components/     componentes de interfaz
  composition/    composición de pantallas
  contexts/       contextos de React
  core/           lógica compartida
  config/         configuración, incluida la URL de la API
  shared/ utils/  apoyo
tests/            pruebas con Vitest
```

## Tecnología

Next.js 16 (App Router) · React 19 · TypeScript · Ant Design 5 · Vitest · Vercel

---

<div align="center">
  <sub>Parte del ecosistema <a href="https://github.com/NezuSas">NEZU</a> · <a href="https://nezuecuador.com">nezuecuador.com</a> · © NEZU S.A.S. Publicado para clientes e integradores de NEZU.</sub>
</div>
