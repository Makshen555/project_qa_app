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

## Endpoints Principales

### Auth

- `POST /api/auth/login`  
- `GET /api/auth/csrf-token`  

---

### Usuarios

- `GET /api/users`  
- `POST /api/users`  
- `PUT /api/users/:id`  
- `DELETE /api/users/:id`  

---

### Productos

- `GET /api/products`  
- `POST /api/products`  
- `PUT /api/products/:id`  
- `DELETE /api/products/:id`  

---

### Auditoría

- `GET /api/audit` (solo SUPERADMIN)  

---

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
