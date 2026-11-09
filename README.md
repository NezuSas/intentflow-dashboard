<div align="center">
  <img src=".github/banner.svg" alt="NEZU · IntentFlow Dashboard, panel administrativo del Intent Manager" width="100%">
</div>

# IntentFlow Dashboard

> **In English.** The admin dashboard of NEZU's Intent Manager: intents, Android boards, commands, clients, users and subscriptions. The backend is private, but a public demo with sample data runs entirely in the browser. Next.js, React and Ant Design.

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

## Demo pública

No hace falta el backend para ver el panel: la [**demo en línea**](https://nezusas.github.io/intentflow-dashboard/) corre con datos de ejemplo (tres clientes, seis pantallas, un mes de actividad) y permite recorrer todas las secciones, crear, editar y borrar registros. Todo ocurre en el navegador; nada se guarda ni se envía.

![Resumen del panel con datos de ejemplo](.github/screenshots/dashboard.jpg)

| Intenciones | Pantallas |
|---|---|
| ![Intenciones](.github/screenshots/intenciones.jpg) | ![Pantallas](.github/screenshots/pantallas.jpg) |

Para levantarla en local:

```bash
NEXT_PUBLIC_DEMO=1 npm run dev
```

Con `NEXT_PUBLIC_DEMO=1`, `npm run build` genera además la exportación estática en `out/` que alimenta la demo pública (ruta base `/intentflow-dashboard`, configurable con `NEXT_PUBLIC_BASE_PATH`). Los datos y los repositorios de la demo viven en `src/demo/`; una build normal no los usa.

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

## ¿Lo necesitas en tu operación?

Este panel es gratuito: lo publicamos porque lo usamos en nuestros propios proyectos. Si quieres un panel así para tu operación, conectado a tus dispositivos y a tu equipo, [cuéntanos qué necesitas](https://nezuecuador.com/es/contacto) y te respondemos con una propuesta concreta. Aquí está [lo que hacemos](https://nezuecuador.com/es/servicios).

## Licencia

Licencia NEZU de uso para clientes e integradores: puedes leer, instalar y operar el código y proponer mejoras; no puedes redistribuirlo, venderlo ni usarlo para construir un producto o servicio competidor. Texto completo en [LICENSE.md](LICENSE.md).

---

<div align="center">
  <sub>Parte del ecosistema <a href="https://github.com/NezuSas">NEZU</a> · <a href="https://nezuecuador.com">nezuecuador.com</a> · © NEZU S.A.S. Publicado para clientes e integradores de NEZU.</sub>
</div>
