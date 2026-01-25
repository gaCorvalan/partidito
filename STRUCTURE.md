# Estructura de Carpetas Recomendada para Nuxt 4

## Estructura Base

```
app/
├── assets/           # Assets personalizados (opcional en Nuxt 4 con build integrado)
│   └── styles/
├── components/       # Componentes reutilizables
│   ├── common/       # Componentes base (Boton, Input, Modal, etc.)
│   └── features/     # Componentes por feature (MatchCard, UserAvatar, etc.)
├── composables/      # Lógica reutilizable y state management
├── layouts/          # Layouts de página
├── middleware/       # Middleware (opcional)
├── pages/            # Rutas y páginas (auto-generan las rutas)
│   ├── index.vue     # Home (Feed)
│   ├── search.vue
│   ├── create.vue    # Publicar partido
│   ├── match/
│   │   ├── index.vue # Lista de partidos (search)
│   │   └── [id].vue  # Detalle del partido
│   ├── chat/
│   │   ├── index.vue # Lista de chats
│   │   └── [id].vue  # Chat del partido
│   └── profile.vue
├── types/            # Definiciones TypeScript
└── utils/            # Utilidades puras
```

## Justificación

### `pages/` (Auto-generación de rutas)
- Nuxt detecta archivos en `pages/` y crea rutas automáticamente
- Ideal para SEO (SSR)
- `[id].vue` para rutas dinámicas (ej. `/match/123`)

### `components/`
**`common/`** - Componentes base usados en múltiples features:
- `Button.vue`, `Input.vue`, `Card.vue`, `Modal.vue`
- `BottomNav.vue`, `Header.vue`

**`features/`** - Componentes específicos de features:
- `MatchCard.vue`, `MatchDetail.vue`
- `MatchForm.vue`, `ChatMessage.vue`
- `UserProfile.vue`

### `composables/`
- Encapsulan lógica reutilizable
- Ejemplos: `useMatches()`, `useAuth()`, `useChat()`, `useFilters()`
- Le da contexto a `pages/` y `components/`

### `layouts/`
- `default.vue` - Layout principal con BottomNav
- `match-layout.vue` - Layout específico para detalle de partido

### `types/`
- `Match.ts`, `User.ts`, `Chat.ts`
- Evita importar tipos duplicados
- Mejor autocompletado en IDEs

### `utils/`
- Funciones puras sin dependencias
- Ejemplos: `formatDate()`, `formatCurrency()`, `distanceTo()`

## Requerimientos SEO

- Archivos en `pages/` están pre-renderizados en SSR
- `<title>`, `<meta>` tags definidos en cada página
- Estructura semántica HTML5
- Rutas amigables (`/match/123` más SEO que `/match?id=123`)

## Recomendación para Partidito

```
app/
├── pages/
│   ├── index.vue          # Feed de partidos
│   ├── search.vue         # Búsqueda con filtros
│   ├── create.vue         # Formulario de crear partido
│   ├── match/
│   │   ├── index.vue      # Lista de resultados de búsqueda
│   │   └── [id].vue       # Detalle del partido
│   ├── chat/
│   │   ├── index.vue      # Lista de conversaciones
│   │   └── [id].vue       # Chat del partido
│   └── profile.vue        # Perfil de usuario
├── components/
│   ├── common/
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Card.vue
│   │   ├── BottomNav.vue
│   │   └── Avatar.vue
│   └── features/
│       ├── MatchCard.vue
│       ├── MatchDetail.vue
│       ├── MatchForm.vue
│       ├── ChatMessage.vue
│       └── UserAvatar.vue
├── composables/
│   ├── useMatches.ts
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useFilters.ts
├── types/
│   ├── match.ts
│   ├── user.ts
│   └── chat.ts
└── utils/
    ├── date.ts
    └── currency.ts
```
