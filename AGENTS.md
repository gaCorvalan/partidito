# AGENTS.md — Partidito

## 0) Objetivo de estas instrucciones
Este archivo define cómo trabajar en este repo con Codex/agentes:
- Priorizar cambios pequeños, verificables y reversibles.
- No inventar requisitos. Si falta información, preguntar.
- Proteger consistencia del producto y evitar lógica “extra” no solicitada.

---

## 1) Producto (resumen)
**Partidito** es una app web mobile-first para encontrar y completar partidos deportivos (inicialmente pádel y fútbol).

**Core del MVP:**
- Feed/listado de partidos
- Búsqueda + filtros
- Publicar partido
- Detalle de partido
- Chat interno
- Perfil de usuario

**Datos:** mockeados/estáticos (sin backend real por ahora).

---

## 2) Idioma y estilo de respuesta
- Responder siempre en español.
- Si hay incertidumbre: declarar supuestos y proponer preguntas concretas.

---

## 3) Estado actual y restricciones (MUY IMPORTANTE)
### Restricciones de cambios
- NO agregar lógica no solicitada explícitamente.
- NO crear nuevos archivos `.md` sin pedir confirmación.
- Si una tarea requiere docs/tests nuevos: proponerlos primero (en bullets) y esperar OK.

### Riesgo
- Evitar “refactors grandes” y cambios masivos.
- Si un cambio toca rutas SSR/SEO o comportamiento del feed: pedir confirmación antes de cerrar.

---

## 4) Tech stack (fuente de verdad)
**Framework:** Nuxt (confirmar versión real en package.json/lockfile)
**UI:** Tailwind
**Lenguaje:** TypeScript
**Render:** SSR

> Nota: `nuxt preview` sirve para previsualizar luego de `nuxt build` y `nuxt start` es alias de `preview` (en Nuxt actual). :contentReference[oaicite:2]{index=2}

---

## 5) Comandos (obligatorio usarlos)
```bash
pnpm dev           # Dev server
pnpm build         # Build prod
pnpm generate      # SSG
pnpm preview       # Preview prod build
pnpm lint          # ESLint (Nuxt ESLint)
```

### Regla: antes de finalizar un cambio que toca lógica/UX, correr al menos:
- pnpm lint
- ESLint en Nuxt (referencia):

---

## 6) Estructura del repo (mapa mínimo)
(Actualizar esta sección cuando el repo crezca)
- pages/ — rutas y pantallas
- components/ — componentes UI
- composables/ — lógica reusable (hooks)
- server/ — endpoints/SSR server routes (si aplica)
- assets/ — estilos/recursos
- public/ — estáticos

### Reglas de arquitectura:
- Lógica de negocio va a composables/ o a una capa domain/ si aparece.
- Componentes deben ser “tontos” cuando sea posible: reciben props / emiten eventos.

---

## 7) Estándar de entrega (para PRs o cambios)

### Siempre incluir:

- Qué cambié (1–3 bullets)
- Cómo probarlo (pasos manuales + comandos)
- Riesgos/edge cases (1–3 bullets)
- Qué queda pendiente (si aplica)

---

## 8) Testing (estado actual + plan)

Actualmente NO hay framework de tests configurado.

Si la tarea agrega lógica importante:
- Proponer (sin implementar aún) una estrategia mínima de tests.

> Nota: Nuxt recomienda @nuxt/test-utils para unit/e2e en Nuxt.

---

## 9) Skills (cómo deben usarse)
Si existen skills instaladas, el agente debe:
- usar skills para tareas repetibles (p. ej. “triage”, “safe PR”, “plan de tests”).
- Si no encuentra una skill apropiada, actuar normal y proponer crear una.