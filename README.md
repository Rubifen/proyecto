# AI Game Portal

Un portal de juegos web local (estilo Friv) donde los juegos son generados por IA.

## Dependencias
- `express`
- `cors`
- `sqlite3`
- `dotenv`

## Registro de Cambios

### Fase 0 - Paso 0.1
- Inicializado proyecto Node.js (`npm init -y`).
- Creada la estructura de carpetas: `public/`, `public/css/`, `public/js/`, `public/games/`, `src/`.

### Fase 0 - Paso 0.2
- Instaladas las dependencias: `express`, `cors`, `sqlite3` y `dotenv`.

### Fase 0 - Paso 0.3
- Actualizado el archivo README.md inicial con el título del proyecto, la descripción, la lista de dependencias y la sección "Registro de Cambios".

### Fase 0 - Paso 0.4
- Configurado el archivo `.gitignore` básico (excluyendo `node_modules`, `.env` y la base de datos `sqlite`).

### Fase 1 - Paso 1.1 y 1.2
- Creado `src/db.js` configurando la conexión a SQLite en `database.sqlite`.
- Creada la tabla `games` con los campos id, title, filename, prompt_used y created_at.

### Fase 1 - Paso 1.3 y 1.4
- Creado `src/server.js` con configuración básica de Express (CORS, JSON y archivos estáticos).
- Añadido script `start` en `package.json`.

### Fase 2 - Paso 2.1 y 2.2
- Creado endpoint `GET /api/games` en `src/server.js`.
- Creado endpoint `POST /api/games` (modo stub) que genera un archivo HTML falso y guarda el registro en la base de datos.

### Fase 3 - Paso 3.1
- Creado `public/index.html` con header, grid principal y footer para el botón de creación.

### Fase 3 - Paso 3.2
- Creado `public/css/styles.css` con diseño oscuro premium: grid responsivo, tarjetas con hover animado y efectos glassmorphism.

### Fase 3 - Paso 3.3
- Creado `public/js/app.js` con función `loadGames()` que hace fetch a `/api/games` y renderiza dinámicamente el grid.

### Fase 4 - Paso 4.1 al 4.5
- Añadida barra inferior fija con botón "+" de creación.
- Diseñado y ocultado el Modal de creación con botón "X" y lógica de apertura/cierre.
- Implementado selector visual Modo Simple / Modo Avanzado.
- Creado formulario Simple (Temática, Tipo de Juego, Colores) y Avanzado (Textarea de prompt libre).
- Añadido botón "Generar Juego" y estado visual de generación con spinner.

### Fase 5 - Paso 5.1 al 5.3
- El formulario intercepta el submit y hace fetch POST a `/api/generate`.
- Creado endpoint `POST /api/generate` en el backend con generación simulada de HTML.
- Al completar la generación, el modal se cierra y el grid se refresca automáticamente.

### Fase 6 - Paso 6.1 al 6.4
- Creado `public/play.html` con iframe sandboxed y botón de volver al catálogo.
- Creado `public/css/play.css` con diseño del reproductor a pantalla completa.
- Creado `public/js/play.js` que lee el parámetro `file` de la URL e inyecta el src en el iframe.
- Las tarjetas del grid redirigen a `play.html?file=[filename]`.

### Fase 7 - Paso 7.1 y 7.2
- El endpoint `/api/generate` incluye la función `callAI()` con estructura preparada para OpenAI, Anthropic Claude y Google Gemini (comentados).
- Implementado el `SYSTEM_PROMPT` interno que obliga a la IA a devolver únicamente código HTML válido y autocontenido.

### Integración OpenRouter
- Integrado OpenRouter como proveedor de IA real (modelo: `google/gemini-2.0-flash-001`).
- Usa `fetch` nativo, sin dependencias extra.
- La API key se carga desde `.env` (excluido del repositorio por `.gitignore`).

---

## Parches de Actualización

### v1.1 — Estética Friv + Prompt Mejorado + Mejor Modelo
- **[UI]** Rediseño completo de `public/css/styles.css` al estilo Friv original: fondo naranja vibrante, tiles cuadrados pequeños (106px) y coloridos, header y footer oscurecidos, botón de creación amarillo con sombra.
- **[UI]** Tiles con paleta de 7 colores rotativos y efecto hover de escala pronunciado (como Friv).
- **[AI]** System Prompt completamente reescrito: incluye requisitos de calidad visual (gradientes, partículas, animaciones, pantallas de inicio/fin) y calidad técnica (requestAnimationFrame, deltaTime, Canvas API, clases ES6, controles táctiles).
- **[AI]** Modelo cambiado a `anthropic/claude-opus-4-5` — el más capaz para generación creativa de código complejo.
