# agents.md

## Descripción general del producto

Este producto es una **aplicación web mobile-first** cuyo objetivo es facilitar que personas encuentren otros jugadores para **completar u organizar partidos deportivos**, inicialmente enfocado en **pádel y fútbol**.

La problemática principal que resuelve es:
- Dificultad para encontrar jugadores disponibles.
- Cancelaciones de último momento.
- Falta de un lugar simple y rápido para coordinar partidos casuales.

El producto **no es una red social**.
Es una aplicación **orientada a tareas**, donde el foco está en la rapidez, claridad y reducción de fricción para concretar un partido.

El caso de uso principal es:
> “Me falta uno (o dos) jugadores para un partido y necesito resolverlo rápido”.

---

## Objetivos del producto

- Minimizar la cantidad de pasos necesarios para:
  - Descubrir partidos disponibles.
  - Unirse a un partido.
  - Publicar un partido.
- Priorizar la toma de decisiones rápida sobre la exploración.
- Ofrecer una experiencia optimizada para dispositivos móviles.
- Permitir que el contenido sea indexable por motores de búsqueda (SEO).

---

## Alcance del MVP (actual)

Este documento describe **exclusivamente el frontend del MVP**.

No existe en esta etapa:
- Backend funcional.
- Base de datos real.
- Autenticación real.
- Comunicación en tiempo real real.

Todos los datos deben ser **mockeados o estáticos**.

No se deben asumir funcionalidades no definidas explícitamente en este documento.

---

## Estructura general de la aplicación

La aplicación utiliza una **navegación inferior (bottom navigation)** con las siguientes vistas principales:

1. Home (Feed)
2. Búsqueda
3. Publicar partido
4. Chats
5. Perfil

---

## Pantallas del producto

### 1. Home (Feed)

**Propósito:**
Mostrar partidos disponibles en formato feed para que el usuario pueda evaluar y unirse rápidamente.

**Características principales:**
- Layout basado en tarjetas (cards).
- Cada tarjeta representa un partido.
- La acción principal (“Unirme”) está siempre visible.
- El usuario debe poder decidir si un partido le interesa sin entrar al detalle.

**Información mostrada en cada tarjeta:**
- Estado: “Falta 1” / “Faltan 2”.
- Deporte y nivel (Principiante / Intermedio / Avanzado).
- Fecha y horario.
- Lugar y distancia (texto informativo).
- Precio por jugador.
- Cantidad de jugadores actuales vs totales.
- Botón “Unirme” (deshabilitado si el partido está completo).

---

### 2. Búsqueda

**Propósito:**
Permitir encontrar partidos específicos mediante filtros, sin necesidad de recorrer el feed completo.

**Filtros disponibles:**
- Deporte.
- Fecha (Hoy / Mañana / Esta semana).
- Rango horario.
- Distancia.
- Nivel (3 niveles).

**Resultados:**
- Se muestran utilizando el mismo componente de tarjeta que el feed principal.

---

### 3. Publicar partido

**Propósito:**
Permitir crear un partido de forma rápida y con el menor esfuerzo posible.

**Acceso:**
- Botón central “+” en la navegación inferior.

**Formulario (campos mínimos):**
- Deporte.
- Cantidad de jugadores faltantes (1 o 2).
- Fecha.
- Horario.
- Lugar (input de texto).
- Nivel (Principiante / Intermedio / Avanzado).
- Precio por jugador.
- Nota opcional corta.

Al publicar, el usuario es redirigido a la vista de detalle del partido.

---

### 4. Detalle del partido

**Propósito:**
Mostrar la información completa del partido y permitir la interacción principal.

**Contenido:**
- Estado del partido.
- Fecha y horario.
- Lugar (placeholder, sin mapa real).
- Nivel.
- Precio por jugador.
- Lista de jugadores (avatars o iniciales).

**Acciones disponibles:**
- Unirse / Salir.
- Compartir.
- Cancelar partido (visible solo para el creador).

La pantalla incluye dos secciones:
- Información.
- Chat.

---

### 5. Chat del partido

**Propósito:**
Permitir la coordinación básica entre los jugadores del partido.

**Características:**
- Lista de mensajes simple.
- Mensajes de usuarios.
- Mensajes de sistema (ej. “Un usuario se unió al partido”).
- Campo de texto para enviar mensajes.

No se incluyen funcionalidades avanzadas de chat.

---

### 6. Lista de chats

**Propósito:**
Acceso rápido a las conversaciones activas.

**Cada item muestra:**
- Deporte.
- Lugar.
- Fecha y horario.
- Vista previa del último mensaje.

Al seleccionar un chat se navega al detalle del partido con la sección de chat activa.

---

### 7. Perfil

**Propósito:**
Proveer una identidad mínima del usuario y generar confianza básica.

**Información incluida:**
- Avatar (placeholder).
- Nombre.
- Deportes preferidos.
- Nivel por deporte.
- Zona o área.
- Acción para editar perfil.

No se incluyen configuraciones avanzadas ni aspectos sociales.

---

## Principios de diseño

- Mobile-first.
- Interfaz limpia y minimalista.
- Diseño basado en tarjetas.
- Jerarquía visual clara.
- Acciones principales siempre visibles.
- Uso moderado del color.
- Tono equilibrado: funcional pero cercano.

---

## Tecnologías (solo frontend)

El MVP utiliza únicamente tecnologías de frontend:

- **Framework:** Nuxt 3
- **Estilos:** Tailwind CSS
- **Renderizado:** Server-Side Rendering (SSR) para SEO
- **Datos:** Mockeados / estáticos

No se debe asumir ningún tipo de backend ni integración externa.

---

## Fuera de alcance (explícitamente excluido)

- Sistemas de reputación o ranking.
- Organización de torneos.
- Emparejamiento fijo de compañeros.
- Mapas interactivos.
- Pagos, reservas o monetización.
- Aplicaciones móviles nativas.
- Seguimiento en tiempo real de ubicación.

---

## Principio rector

Cualquier funcionalidad que no contribuya directamente a:
- encontrar un partido más rápido,
- unirse con menos fricción,
- o publicar un partido de forma simple,

no debe formar parte del MVP.
