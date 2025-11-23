# API DICRI - Sistema de Gestión de Evidencia Criminalística

API RESTful para la Dirección de Investigación Criminalística del Ministerio Público de Guatemala. Sistema completo de gestión de expedientes e indicios con flujo de estados, control de roles y auditoría.

## 🚀 Características

- **Autenticación JWT** con bcrypt para contraseñas seguras
- **Control de roles**: ADMIN, COORDINADOR, TECNICO
- **Flujo de estados** para expedientes:
  - BORRADOR → EN_REVISION → APROBADO/RECHAZADO
- **Auditoría completa** mediante triggers y bitácoras
- **Documentación Swagger** interactiva
- **Procedimientos almacenados** en SQL Server para lógica de negocio

## 📋 Requisitos Previos

- Node.js 14+ 
- SQL Server 2019+ (o SQL Server Management Studio 2022)
- Base de datos `DB_DICRI` configurada y ejecutada con los scripts provistos

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/natalycux/API_DICRI.git
cd API_DICRI/API_DICRI
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Editar el archivo `.env` con la configuración de tu base de datos:

```env
# Configuración del servidor
PORT=4000
SECRET_KEY=TU_CLAVE_SECRETA_JWT_DICRI

# Configuración de SQL Server
DB_USER=sa
DB_PASSWORD=TuPasswordDelSQLServer
DB_SERVER=localhost
DB_DATABASE=DB_DICRI
```

### 4. Actualizar el usuario admin en la base de datos

**IMPORTANTE**: El usuario admin debe tener la contraseña hasheada con bcrypt.

Ejecuta el siguiente script en SQL Server para actualizar el hash:

```sql
-- El hash bcrypt de 'pass' es:
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

UPDATE Tbl_Usuario
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE id_usuario = 1;
```

Ahora podrás hacer login con:
- **Usuario**: `admin`
- **Contraseña**: `pass`

### 5. Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en: `http://localhost:4000`

## 📚 Documentación API (Swagger)

Accede a la documentación interactiva en:

```
http://localhost:4000/api-docs
```

Aquí podrás:
- Ver todos los endpoints disponibles
- Probar las peticiones directamente desde el navegador
- Autorizar con tu token JWT

## 🔐 Autenticación

### 1. Login

**POST** `/api/auth/login`

```json
{
  "usuario_login": "admin",
  "password_plano": "pass"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id_usuario": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "rol": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Usar el token en peticiones

En Swagger:
1. Haz clic en el botón **"Authorize"** (candado verde)
2. Ingresa el token: `Bearer tu_token_jwt_aqui`
3. Ahora puedes probar los endpoints protegidos

En herramientas como Postman:
- Header: `Authorization`
- Valor: `Bearer tu_token_jwt_aqui`

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Gestión completa de usuarios, catálogos geográficos y roles |
| **COORDINADOR** | Aprobar/Rechazar expedientes, ver reportes |
| **TECNICO** | Crear y editar expedientes (BORRADOR/RECHAZADO), gestionar indicios |

## 📊 Flujo de Estados de Expedientes

```
BORRADOR (1) → EN_REVISION (2) → APROBADO (3)
                      ↓
                RECHAZADO (4) → EN_REVISION (2)
```

**Reglas:**
- TECNICO envía de BORRADOR a EN_REVISION
- COORDINADOR/ADMIN aprueba o rechaza
- RECHAZADO requiere justificación obligatoria
- APROBADO es estado final (no se puede cambiar)

## 🛣️ Endpoints Principales

### Expedientes

- `POST /api/expedientes` - Crear expediente (TECNICO)
- `GET /api/expedientes` - Listar con filtros (TECNICO, COORDINADOR)
- `GET /api/expedientes/:id` - Detalle completo (TECNICO, COORDINADOR)
- `PUT /api/expedientes/:id` - Actualizar (TECNICO, solo BORRADOR/RECHAZADO)
- `PUT /api/expedientes/:id/estado` - Cambiar estado (TECNICO, COORDINADOR)
- `GET /api/expedientes/conteo` - Conteo por estado (COORDINADOR, ADMIN)

### Indicios

- `POST /api/expedientes/:id/indicios` - Agregar indicio (TECNICO)
- `PUT /api/expedientes/:id/indicios/:idIndicio` - Actualizar (TECNICO)
- `DELETE /api/expedientes/:id/indicios/:idIndicio` - Eliminar (TECNICO)

### Usuarios

- `POST /api/users` - Crear usuario (ADMIN)
- `GET /api/users` - Listar usuarios (ADMIN)
- `PUT /api/users/:id` - Actualizar usuario (ADMIN)

### Catálogos

- `GET /api/catalogos/geograficos` - Departamentos, Municipios, Fiscalías
- `GET /api/catalogos/roles` - Lista de roles (ADMIN)
- `GET /api/catalogos/estados` - Estados de expediente
- `POST /api/catalogos/departamentos` - Crear departamento (ADMIN)
- `POST /api/catalogos/municipios` - Crear municipio (ADMIN)
- `POST /api/catalogos/fiscalias` - Crear fiscalía (ADMIN)

## 🔧 Tecnologías

- **Node.js** + **Express** - Framework web
- **SQL Server** - Base de datos con SPs y triggers
- **mssql** - Driver para SQL Server
- **bcryptjs** - Hasheo seguro de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **Swagger** - Documentación interactiva de la API
- **dotenv** - Gestión de variables de entorno

## 📝 Ejemplo de Uso Completo

### 1. Login como Admin

```bash
POST http://localhost:4000/api/auth/login
{
  "usuario_login": "admin",
  "password_plano": "pass"
}
```

### 2. Crear un usuario Técnico

```bash
POST http://localhost:4000/api/users
Authorization: Bearer <token_admin>
{
  "id_rol": 3,
  "nombre": "Juan",
  "apellido": "Pérez",
  "usuario_login": "jperez",
  "password_plano": "tecnico123",
  "estado": true
}
```

### 3. Login como Técnico y crear expediente

```bash
POST http://localhost:4000/api/auth/login
{
  "usuario_login": "jperez",
  "password_plano": "tecnico123"
}

# Con el token del técnico:
POST http://localhost:4000/api/expedientes
Authorization: Bearer <token_tecnico>
{
  "codigo_expediente": "DICRI-2025-001",
  "id_fiscalia": 1,
  "descripcion_corta": "Inspección de escena por robo agravado"
}
```

### 4. Agregar indicios

```bash
POST http://localhost:4000/api/expedientes/1/indicios
Authorization: Bearer <token_tecnico>
{
  "nombre_objeto": "Arma de fuego",
  "descripcion": "Pistola 9mm",
  "color": "Negro",
  "peso": 0.65,
  "ubicacion_en_escena": "Sala principal"
}
```

### 5. Enviar a revisión

```bash
PUT http://localhost:4000/api/expedientes/1/estado
Authorization: Bearer <token_tecnico>
{
  "id_estado_nuevo": 2
}
```

### 6. Aprobar (como Coordinador)

```bash
PUT http://localhost:4000/api/expedientes/1/estado
Authorization: Bearer <token_coordinador>
{
  "id_estado_nuevo": 3
}
```

## 🐛 Solución de Problemas

### Error de conexión a SQL Server

- Verifica que SQL Server esté corriendo
- Revisa las credenciales en `.env`
- Asegúrate que la BD `DB_DICRI` exista

### Token inválido o expirado

- Los tokens expiran en 8 horas
- Vuelve a hacer login para obtener uno nuevo

### Usuario admin no puede hacer login

- Verifica que el hash en la BD sea el correcto (bcrypt)
- Ejecuta el script de actualización de contraseña

## 📄 Licencia

ISC

## 👨‍💻 Autor

Nataly Cux - [GitHub](https://github.com/natalycux)

---

**Ministerio Público de Guatemala - DICRI**
