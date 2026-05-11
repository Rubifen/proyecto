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
