# QA Secure Web Application

## Descripción del Proyecto

Este proyecto consiste en el desarrollo de una aplicación web segura enfocada en la implementación de controles de seguridad modernos.

El sistema permite la gestión de **usuarios y productos** mediante una arquitectura basada en:

- API REST protegida
- Interfaz web (EJS)
- Control de acceso por roles (RBAC)
- Auditoría completa de eventos

El objetivo principal es demostrar la aplicación práctica de mecanismos de defensa frente a amenazas comunes en aplicaciones web.

---

## Arquitectura del Sistema

El sistema está compuesto por:

- **Frontend Web (EJS)** → Interfaz de usuario  
- **Backend API (Express)** → Lógica de negocio  
- **Base de datos (PostgreSQL)** → Persistencia  
- **ORM (Prisma)** → Acceso seguro a datos  

---

## Stack Tecnológico

| Componente | Tecnología |
|----------|--------|
| Backend | Node.js + Express |
| Base de Datos | PostgreSQL |
| ORM | Prisma |
| Frontend | EJS |
| Autenticación | JWT |
| Seguridad HTTP | Helmet |
| CSRF | csurf |
| Hash de contraseñas | bcrypt (cost ≥ 12) |
| Contenedores | Docker + Docker Compose |

---

## Justificación del Stack

- **Node.js + Express:** Framework ligero, flexible y ampliamente adoptado.  
- **Prisma ORM:** Garantiza consultas parametrizadas → evita SQL Injection.  
- **PostgreSQL:** Base de datos robusta y confiable.  
- **EJS:** Renderizado seguro (escape automático contra XSS).  
- **JWT + Cookies HttpOnly:** Manejo seguro de autenticación.  
- **Helmet:** Implementación de headers de seguridad.  
- **Docker:** Permite ejecución reproducible con un solo comando.  

---

## Ejecución del Proyecto

### 1. Clonar el repositorio

```bash
git clone <https://github.com/Makshen555/project_qa_app>
cd project_qa_app
```

### 2. Ejecutar con Docker
```bash
docker-compose up --build
```

### 3. Acceder a la aplicación
http://localhost:8080

## Requerimientos Funcionales Implementados

### RF-04 | Gestión de Usuarios

- CRUD completo de usuarios  

**Campos:**
- username  
- email  
- password (hash seguro)  
- rol  

**Visualización incluye:**
- rol  
- permisos  
- último login  

**Auditoría de:**
- CREATE_USER  
- UPDATE_USER  
- DELETE_USER  
- ROLE_CHANGE  

---

### RF-03 | Gestión de Productos

- CRUD completo de productos  

**Campos:**
- code  
- name  
- description  
- quantity  
- price  

**Validaciones:**
- Tipos de datos  
- Campos obligatorios  
- Rangos numéricos  

---

### RF-05 | Control de Acceso (RBAC)

| Rol | Permisos |
|-----|--------|
| SUPERADMIN | CRUD usuarios, productos, auditoría |
| REGISTRADOR | CRUD productos, lectura usuarios |
| AUDITOR | Solo lectura |

✔ Validación en backend  
✔ Protección contra acceso por URL directa  

---

### 📊 RF-06 | Auditoría

**Se registran:**

- Logins exitosos y fallidos  
- CRUD de usuarios (web + API)  
- CRUD de productos (web + API)  
- Cambios de rol  
- Accesos denegados (403)  

**Cada evento incluye:**

- Usuario  
- Acción  
- Entidad  
- IP  
- Timestamp  

✔ Visible solo para SUPERADMIN  

---

### 🔑 RF-07 | API REST Segura

- Endpoints protegidos con JWT  
- Token en cookies HttpOnly  
- Expiración: 1 hora  
- Verificación de firma en cada request  

---

## Requerimientos de Seguridad Implementados

---

### RS-01 | SQL Injection

- Uso de Prisma ORM (consultas parametrizadas)  
- Prohibido concatenar input en SQL  

---

### RS-02 | XSS

- Escape automático en EJS  
- CSP configurado con Helmet  
- No uso de `innerHTML` inseguro  

---

### RS-03 | CSRF

- Tokens CSRF en formularios de escritura  
- Validación en backend  

---

### RS-04 | Gestión de Sesiones

- Expiración tras 5 minutos de inactividad  
- Cookies HttpOnly  
- Prevención de Session Fixation  

---

### RS-05 | JWT

- Expiración: 1 hora  
- Firma validada en cada request  
- No uso de localStorage  

---

### RS-06 | Headers de Seguridad

**Implementados con Helmet:**

- Content-Security-Policy  
- X-Frame-Options  
- X-Content-Type-Options  
- Strict-Transport-Security  
- Referrer-Policy  

---

### RS-07 | Protección contra fuerza bruta

- Máximo 5 intentos fallidos  
- Bloqueo de cuenta por 5 minutos  
- Registro en auditoría  

---

## Endpoints de la API

La API REST expone endpoints para autenticación, gestión de usuarios, gestión de productos y auditoría.

Todas las rutas protegidas requieren autenticación mediante JWT en cookies HttpOnly.  
Las operaciones de escritura (`POST`, `PUT`, `DELETE`) requieren además un token CSRF válido.

---

## Autenticación

### Obtener token CSRF

**Método:** `GET`  
**Ruta:** `/api/auth/csrf-token`

Obtiene el token CSRF necesario para realizar peticiones protegidas.

**Response:**

```json
{
  "csrfToken": "string"
}
```

### Login

**Método:** `POST`  
**Ruta:** `/api/auth/login`

Permite autenticar un usuario en el sistema.

**Headers:**

```http
Content-Type: application/json
x-csrf-token: <csrfToken>
```

**Body:**

```json
{
  "email": "admin@test.com",
  "password": "Admin123*"
}
```

**Body:**

```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "email": "admin@test.com",
    "role": "SUPERADMIN"
  }
}
```

## Usuarios

### Listar usuarios

**Método:** `GET`  
**Ruta:** `/api/users`

**Roles permitidos:**
- SUPERADMIN
- AUDITOR
- REGISTRADOR

**Response:**

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@test.com",
    "role": "SUPERADMIN",
    "permissions": "SUPERADMIN",
    "lastLogin": "2026-04-22T10:00:00.000Z"
  }
]
```

### Crear usuario

**Método:** `POST`  
**Ruta:** `/api/users`

**Roles permitidos:**
- SUPERADMIN

**Headers:**

```http
Content-Type: application/json
x-csrf-token: <csrfToken>
```

**Response:**

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@test.com",
    "role": "SUPERADMIN",
    "permissions": "SUPERADMIN",
    "lastLogin": "2026-04-22T10:00:00.000Z"
  }
]
```

**Comportamiento:**

- La contraseña se almacena con bcrypt.
- Se registra el evento `CREATE_USER` en auditoría.

### Actualizar usuario

**Método:** `PUT`  
**Ruta:** `/api/users/:id`

**Roles permitidos:**
- SUPERADMIN

**Headers:**

```http
Content-Type: application/json
x-csrf-token: <csrfToken>
```

**Response:**

```json
{
  "username": "usuario_actualizado",
  "email": "actualizado@test.com",
  "roleId": 3
}
```

**Comportamiento:**

- Si se cambia el rol, se registra `ROLE_CHANGE`.
- Se registra el evento `UPDATE_USER`.

### Eliminar usuario

**Método:** `DELETE`  
**Ruta:** `/api/users/:id`  

**Roles permitidos:**
- SUPERADMIN  

**Headers:**
```http
x-csrf-token: <csrfToken>
```

**Comportamiento:**

- Elimina el usuario indicado.
- Registra el evento `DELETE_USER`.

## Productos

### Listar productos

**Método:** `GET`
**Ruta:** `/api/products`

**Roles permitidos:**

- SUPERADMIN
- REGISTRADOR
- AUDITOR

**Response:**

```json
[
  {
    "id": 1,
    "code": "P001",
    "name": "Teclado",
    "description": "Teclado mecánico",
    "quantity": 10,
    "price": 25000,
    "createdAt": "2026-04-22T10:00:00.000Z",
    "updatedAt": "2026-04-22T10:00:00.000Z"
  }
]
```

### Crear producto

**Método:** `POST`
**Ruta:** `/api/products`

**Roles permitidos:**

- SUPERADMIN
- REGISTRADOR

**Headers:**

```http
Content-Type: application/json
x-csrf-token: <csrfToken>
```

Body:

```json
{
  "code": "P001",
  "name": "Teclado",
  "description": "Teclado mecánico",
  "quantity": 10,
  "price": 25000
}
```
**Comportamiento:**

- Valida campos obligatorios.
- Valida cantidad y precio.
- Registra el evento `REATE_PRODUCT`.

### Actualizar producto

**Método:** `PUT`
**Ruta:** `/api/products/:id`

**Roles permitidos:**

- SUPERADMIN
- REGISTRADOR

**Headers:**

```http
Content-Type: application/json
x-csrf-token: <csrfToken>
```

**Body:**

```json
{
  "code": "P001",
  "name": "Teclado actualizado",
  "description": "Teclado mecánico RGB",
  "quantity": 15,
  "price": 30000
}
```

**Comportamiento:**

- Actualiza el producto indicado.
- Registra el evento `UPDATE_PRODUCT`.

### Eliminar producto

**Método:** `DELETE`
**Ruta:** `/api/products/:id`

**Roles permitidos:**

- SUPERADMIN

**Headers:**
```http
x-csrf-token: <csrfToken>
```

**Comportamiento:**

- Elimina el producto indicado.
- Registra el evento `DELETE_PRODUCT`.

## Auditoría
### Ver logs de auditoría

**Método:** `GET`
**Ruta:** `/api/audit`

**Roles permitidos:**

- SUPERADMIN

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "action": "LOGIN_SUCCESS",
    "entity": "Auth",
    "entityId": null,
    "ipAddress": "127.0.0.1",
    "details": null,
    "createdAt": "2026-04-22T10:00:00.000Z"
  }
]
```

## Consideraciones de Seguridad en la API
- Las rutas protegidas requieren JWT válido.
- El JWT se almacena en cookie HttpOnly.
- No se utiliza localStorage para almacenar tokens.
- Las operaciones de escritura requieren token CSRF.
- Las consultas a base de datos se realizan con Prisma ORM.
- El sistema registra eventos críticos en auditoría.
- El login bloquea temporalmente tras 5 intentos fallidos.

## Flujo recomendado de prueba en Postman
1. Ejecutar `GET /api/auth/csrf-token`.
2. Copiar el valor de `csrfToken`.
3. Ejecutar `POST /api/auth/login` enviando el header:
```http
x-csrf-token: <csrfToken>
```
4. Verificar que Postman conserve las cookies.
5. Consumir endpoints protegidos.
6. Para operaciones `POST`, `PUT` y `DELETE`, enviar siempre el header:
```http
x-csrf-token: <csrfToken>
```

## Pruebas de Seguridad Realizadas

- Login incorrecto → bloqueo tras 5 intentos  
- Acceso sin permisos → 403 + log  
- Peticiones sin CSRF → rechazadas  
- SQL Injection → mitigado por ORM  
- Manipulación de JWT → acceso denegado  

---

## Conclusión

El sistema cumple con:

✔ Todos los requerimientos funcionales (RF)  
✔ Todos los requerimientos de seguridad (RS)  
✔ Arquitectura segura y modular  
✔ Auditoría completa  

---

## Autor

**Luis Andrés Gómez**
