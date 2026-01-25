# agents.md

## Descripción del Producto

Partidito es una aplicación web mobile-first para facilitar que personas encuentren otros jugadores para completar u organizar partidos deportivos (inicialmente pádel y fútbol).

**Objetivo principal:** Permitir que los usuarios encuentren partidos disponibles, se unan rápidamente y publiquen partidos de forma simple.

**Características:** Feed de partidos, búsqueda con filtros, publicación de partidos, detalle del partido, chat interno, perfil de usuario.

**Tecnologías:** Nuxt 3, Tailwind CSS, TypeScript, SSR.

---

## Reglas de Comportamiento

- Los agentes siempre deben seguir las reglas.
- Los agentes siempre deben responder en español.

---

## Comandos Build, Lint y Test

```bash
npm run dev           # Start development server (Nuxt 3 SSR)
npm run build         # Build for production
npm run generate      # Generate static site (SSG)
npm run preview       # Preview production build
npm run lint          # Run ESLint (Nuxt ESLint module)
```

**Ejecutar un solo test:** No hay framework de tests configurado.

---

## Tecnologías Actuales

**Framework y Core:**
- Nuxt 4.3.0
- Vue 3.5.27
- Vue Router 4.6.4

**Estilos:**
- Tailwind CSS
- @nuxtjs/tailwindcss: 6.14.0

**UI y Assets:**
- @nuxt/icon: 2.2.1
- @nuxt/image: 2.0.0
- @nuxt/fonts: 0.13.0

**Quality:**
- ESLint: ^9.39.2
- @nuxt/eslint: 1.13.0

**Renderizado:** Server-Side Rendering (SSR) para SEO
**Datos:** Mockeados / estáticos (sin backend real)

Reglas
- Los agentes no deben crear archivos.md, sin consultarlo antes.
- Los agentes no deben agregar logica que no haya sido pedida con antelacion
-
