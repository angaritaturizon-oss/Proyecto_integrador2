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