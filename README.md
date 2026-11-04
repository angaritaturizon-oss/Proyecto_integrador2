# Proyecto Integrador 2 — API REST

API de autores y publicaciones desarrollada con Node.js, Express y PostgreSQL.

Incluye CRUD de ambas entidades, validaciones, consultas SQL parametrizadas, manejo centralizado de errores y tests automatizados con Supertest.

## Requisitos

- Node.js 24.
- npm.
- PostgreSQL instalado y en ejecución.
- Git para clonar el repositorio.

## Instalación

Clonar el repositorio y entrar en la carpeta `desarrollo`:

```bash
git clone https://github.com/angaritaturizon-oss/Proyecto_integrador2.git
cd Proyecto_integrador2/desarrollo
npm ci
```

## Configuración

Copiar `.env.example` como `.env` dentro de `desarrollo`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

Completar la configuración:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=proyecto_integrador2
DB_TEST_NAME=proyecto_integrador2_test
```

Reemplazar `your_password` por la contraseña local de PostgreSQL.
Ajustar host, puerto y usuario si corresponde.

El archivo `.env` contiene información privada y no debe subirse a Git.

## Base de datos

Desde una conexión a PostgreSQL, ejecutar por separado:

```sql
CREATE DATABASE proyecto_integrador2;
```

```sql
CREATE DATABASE proyecto_integrador2_test;
```

Conectarse a `proyecto_integrador2` y ejecutar, en este orden:

1. `desarrollo/sql/setup.sql`
2. `desarrollo/sql/seed.sql`

Conectarse a `proyecto_integrador2_test` y ejecutar únicamente:

1. `desarrollo/sql/setup.sql`

La base de pruebas no necesita seed: los tests crean y eliminan sus propios registros.

Para comprobar la base seleccionada:

```sql
SELECT current_database();
```

Los scripts de creación e inserción inicial deben ejecutarse una sola vez en una base nueva.

## Iniciar la API

Desde `desarrollo`:

```bash
npm start
```

Dirección local:

```text
http://localhost:3000
```

La variable de entorno `PORT` permite utilizar otro puerto.

## Endpoints

### Autores

| Método | Ruta | Función |
|---|---|---|
| GET | `/authors` | Listar autores. |
| GET | `/authors/:id` | Consultar un autor. |
| POST | `/authors` | Crear un autor. |
| PUT | `/authors/:id` | Actualizar un autor. |
| DELETE | `/authors/:id` | Eliminar un autor y sus publicaciones. |

Ejemplo de cuerpo para POST y PUT:

```json
{
  "name": "Laura",
  "email": "laura@example.com",
  "bio": "Autora de ejemplo"
}
```

El nombre y el email son obligatorios y deben ser texto no vacío.
La biografía es opcional y debe ser texto si se envía.
Si se omite en PUT, queda en `null`.

El email se guarda sin espacios externos y en minúsculas.
Los emails duplicados se rechazan.

### Publicaciones

| Método | Ruta | Función |
|---|---|---|
| GET | `/posts` | Listar publicaciones. |
| GET | `/posts/:id` | Consultar una publicación. |
| POST | `/posts` | Crear una publicación. |
| PUT | `/posts/:id` | Actualizar una publicación. |
| DELETE | `/posts/:id` | Eliminar una publicación. |

Ejemplo de cuerpo para POST y PUT:

```json
{
  "title": "Mi publicación",
  "content": "Contenido de ejemplo.",
  "author_id": 1,
  "published": false
}
```

El título y el contenido son obligatorios y deben ser texto no vacío.
`author_id` debe ser un número entero positivo y corresponder a un autor existente.

`published` es opcional y debe ser un booleano si se envía.
Si se omite en POST o PUT, se utiliza `false`.

### Respuestas HTTP

| Código | Significado |
|---|---|
| 200 | Consulta o actualización correcta. |
| 201 | Recurso creado. |
| 204 | Recurso eliminado; respuesta sin cuerpo. |
| 400 | Datos o ID inválidos. |
| 404 | Autor o publicación no encontrados. |
| 409 | Email duplicado. |
| 500 | Error interno del servidor. |

Los errores se devuelven como JSON:

```json
{
  "message": "Autor no encontrado"
}
```

## Relación entre entidades

Cada publicación pertenece a un autor mediante `posts.author_id`.

La clave foránea utiliza `ON DELETE CASCADE`: al eliminar un autor,
PostgreSQL elimina también sus publicaciones.

## Tests automatizados

Desde `desarrollo`:

```bash
npm test
```

Las pruebas utilizan `proyecto_integrador2_test`, que debe tener las tablas
creadas y ser accesible con las credenciales configuradas.

No es necesario iniciar el servidor: Supertest importa directamente la aplicación.

Se comprueban estos casos:

- Crear un autor y verificar su persistencia.
- Consultar un autor por ID.
- Crear una publicación relacionada con un autor.
- Eliminar un recurso inexistente y recibir 404.

Después de cada prueba se eliminan los registros creados por ella.

## Organización

- `desarrollo/src/app.js`: configuración de Express.
- `desarrollo/src/server.js`: inicio del servidor.
- `desarrollo/src/routes/`: endpoints de autores y publicaciones.
- `desarrollo/src/services/`: consultas de autores.
- `desarrollo/src/db/`: conexión a PostgreSQL.
- `desarrollo/src/utils/`: validaciones reutilizables.
- `desarrollo/src/middlewares/`: manejo global de errores.
- `desarrollo/tests/`: tests automatizados.
- `desarrollo/sql/`: creación de tablas y datos iniciales.

## Documentación de la API (OpenAPI)

La especificación está en [`documentacion/openapi.yaml`](documentacion/openapi.yaml). Describe las rutas de autores y publicaciones, los datos que reciben y sus posibles respuestas.

Para visualizarla:

1. Abre [Swagger Editor](https://editor.swagger.io/).
2. Copia el contenido de `documentacion/openapi.yaml` y pégalo en el panel del editor.
3. En la vista previa, expande una operación, por ejemplo `GET /authors`, para ver sus parámetros y respuestas.

No necesitas iniciar la API para leer la documentación. Si quieres comprobar una respuesta real, inicia la API con `npm start` desde `desarrollo` y envía la solicitud desde Postman a `http://localhost:3000`.

## Despliegue en Railway

1. Crea un proyecto en Railway con dos servicios: la **API**, conectada al repositorio de GitHub, y una base de datos **PostgreSQL**.
2. En la configuración del servicio de la API, establece **Root Directory** en `/desarrollo` y **Start Command** en `npm start`.
3. En **Variables** del servicio de la API, configura las siguientes referencias. El ejemplo supone que el servicio de base de datos se llama `Postgres`; si tiene otro nombre, usa ese nombre en las referencias.

   | Variable de la API | Valor en Railway |
   |---|---|
   | `DB_HOST` | `${{Postgres.PGHOST}}` |
   | `DB_PORT` | `${{Postgres.PGPORT}}` |
   | `DB_USER` | `${{Postgres.PGUSER}}` |
   | `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
   | `DB_NAME` | `${{Postgres.PGDATABASE}}` |

   El servidor lee `PORT` del entorno. Las credenciales se configuran en Railway y se mantienen fuera del repositorio.

4. En la **base de Railway**, ejecuta `desarrollo/sql/setup.sql` una sola vez para crear las tablas. Para cargar los datos de ejemplo, ejecuta después `desarrollo/sql/seed.sql`. Desde tu computador, puedes conectarte a PostgreSQL mediante el túnel `railway connect Postgres --tunnel-only`. La API usa el host interno de Railway para conectarse a la base.
5. En **Networking** del servicio de la API, genera un dominio público. Para comprobar que la API consulta PostgreSQL, abre [`/authors`](https://proyectointegrador2-production-8b57.up.railway.app/authors) y [`/posts`](https://proyectointegrador2-production-8b57.up.railway.app/posts).

**URL interna de PostgreSQL:** `${{Postgres.DATABASE_URL}}`. Es una referencia privada y puede incluir credenciales. El código de este proyecto usa las cinco variables `DB_*` de la tabla para conectarse a la misma base.

**URL pública de la API:** [https://proyectointegrador2-production-8b57.up.railway.app](https://proyectointegrador2-production-8b57.up.railway.app)

## Registro del uso de IA

Utilicé ChatGPT para entender cómo se conectan las partes de la API y como referencia para algunos cambios de código. Al integrar esos cambios, probé los endpoints en mi entorno para comprobar que respondieran como esperaba.

- «hazme primero un resumen muy pequeno de como conectamos crud a postg, algo que me sirva en un futuro para entender»: esta consulta me ayudó a repasar cómo una solicitud pasa de Express a una consulta parametrizada en PostgreSQL y vuelve como respuesta JSON.
- «dame todo el codigo que debe tener authorsRoutes y errorHandler»: utilicé el ejemplo para integrar el middleware de errores y comprobé con Postman que la API devuelve `409` cuando intento registrar un correo duplicado.

- «no aparece en get, pero ya esta creado en post»: esta consulta me ayudó a detectar que tenía dos rutas `POST /authors` y que la primera guardaba los datos en memoria. Después de corregirlo, verifiqué que el autor aparecía al consultarlo desde PostgreSQL.


