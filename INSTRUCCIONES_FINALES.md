# 🎯 INSTRUCCIONES FINALES - API DICRI

## ✅ Estado del Proyecto

La API ha sido construida completamente y está lista para usar. Todos los componentes están implementados:

### ✓ Componentes Implementados

1. **Autenticación con bcrypt y JWT** ✓
2. **Controladores completos** ✓
   - auth.controller.js (Login con bcrypt)
   - user.controller.js (CRUD usuarios)
   - expediente.controller.js (CRUD expedientes e indicios)
   - catalogos.controller.js (Catálogos geográficos)

3. **Rutas con Swagger** ✓
   - auth.routes.js
   - user.routes.js
   - expediente.routes.js
   - catalogos.routes.js

4. **Middleware de autenticación y autorización** ✓
5. **Documentación Swagger completa** ✓
6. **Configuración de entorno** ✓

## 🚨 IMPORTANTE: Antes de usar la API

### Paso 1: Actualizar el usuario admin en la base de datos

**DEBES ejecutar este script en SQL Server Management Studio:**

Abre el archivo `UPDATE_ADMIN_BCRYPT.sql` y ejecútalo en tu base de datos `DB_DICRI`.

Este script:
- Actualiza la contraseña del admin para usar bcrypt (en lugar de SHA2_256)
- Opcionalmente crea usuarios de prueba (COORDINADOR y TECNICO)

```sql
-- El hash correcto de bcrypt para 'pass':
UPDATE Tbl_Usuario
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE id_usuario = 1;
```

### Paso 2: Verificar la configuración de .env

Asegúrate de que el archivo `.env` tenga las credenciales correctas de tu SQL Server:

```env
DB_USER=sa
DB_PASSWORD=Abc123  # <-- Cambia esto si tu contraseña es diferente
DB_SERVER=localhost
DB_DATABASE=DB_DICRI
```

### Paso 3: Iniciar el servidor

```bash
# Opción 1: Con npm
npm start

# Opción 2: Con node directamente (si PowerShell da problemas)
node server.js
```

El servidor estará disponible en:
- API: http://localhost:4000
- Swagger: http://localhost:4000/api-docs

## 🧪 Probando la API

### 1. Acceder a Swagger

Abre tu navegador en: `http://localhost:4000/api-docs`

### 2. Hacer Login

1. En Swagger, ve a la sección **Autenticación**
2. Expande `POST /auth/login`
3. Haz clic en **"Try it out"**
4. Ingresa las credenciales:
   ```json
   {
     "usuario_login": "admin",
     "password_plano": "pass"
   }
   ```
5. Haz clic en **"Execute"**
6. Copia el `token` de la respuesta

### 3. Autorizar en Swagger

1. Haz clic en el botón **"Authorize"** (candado verde arriba a la derecha)
2. En el campo de texto, ingresa: `Bearer ` seguido de tu token
   - Ejemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Haz clic en **"Authorize"**
4. Cierra el diálogo

¡Ahora puedes probar todos los endpoints protegidos!

### 4. Ejemplos de Endpoints que puedes probar

**Crear un usuario (ADMIN):**
- `POST /api/users`
```json
{
  "id_rol": 3,
  "nombre": "Juan",
  "apellido": "Pérez",
  "usuario_login": "jperez",
  "password_plano": "tecnico123",
  "estado": true
}
```

**Obtener catálogos geográficos:**
- `GET /api/catalogos/geograficos`

**Crear un expediente (TECNICO):**
- Primero haz login con un usuario TECNICO
- `POST /api/expedientes`
```json
{
  "codigo_expediente": "DICRI-2025-001",
  "id_fiscalia": 1,
  "descripcion_corta": "Inspección de escena por robo agravado en Zona 1"
}
```

**Agregar un indicio:**
- `POST /api/expedientes/1/indicios`
```json
{
  "nombre_objeto": "Arma de fuego calibre 9mm",
  "descripcion": "Pistola semiautomática marca Glock",
  "color": "Negro",
  "ubicacion_en_escena": "Sala principal, junto al sofá"
}
```

**Cambiar estado del expediente:**
- `PUT /api/expedientes/1/estado`
```json
{
  "id_estado_nuevo": 2
}
```

## 📊 Flujo Completo de Trabajo

### Escenario: Técnico crea expediente y Coordinador lo aprueba

1. **Login como TECNICO** → Obtener token
2. **Crear expediente** → Estado: BORRADOR (1)
3. **Agregar indicios** al expediente
4. **Enviar a revisión** → Cambiar estado a EN_REVISION (2)
5. **Login como COORDINADOR** → Obtener token
6. **Aprobar expediente** → Cambiar estado a APROBADO (3)

## 🔐 Usuarios Disponibles (si ejecutaste el script completo)

| Usuario | Contraseña | Rol | Permisos |
|---------|-----------|-----|----------|
| `admin` | `pass` | ADMIN | Gestión completa de usuarios y catálogos |
| `coord1` | `coordinador123` | COORDINADOR | Aprobar/Rechazar expedientes |
| `tec1` | `tecnico123` | TECNICO | Crear y editar expedientes |

## 📝 Estados de Expedientes

1. **BORRADOR** - Creado por técnico, puede editar
2. **EN_REVISION** - Enviado a coordinador, no se puede editar
3. **APROBADO** - Aprobado por coordinador, estado final
4. **RECHAZADO** - Rechazado por coordinador, vuelve a editable

## 🛠️ Solución de Problemas

### El servidor no inicia

- Verifica que SQL Server esté corriendo
- Revisa las credenciales en `.env`
- Asegúrate de que la base de datos `DB_DICRI` exista

### No puedo hacer login con admin

- **CAUSA**: No ejecutaste el script `UPDATE_ADMIN_BCRYPT.sql`
- **SOLUCIÓN**: Ejecuta el script en SQL Server para actualizar el hash

### Token inválido o expirado

- Los tokens expiran en 8 horas
- Haz login nuevamente para obtener un nuevo token

### Error "Cannot load file npm.ps1"

- PowerShell tiene restricciones de ejecución
- Usa `node server.js` en lugar de `npm start`

## 📚 Documentación Adicional

Consulta el archivo `README.md` para:
- Información detallada de todos los endpoints
- Ejemplos completos de uso
- Arquitectura del sistema
- Tecnologías utilizadas

## 🎉 ¡Listo!

Tu API DICRI está completamente funcional y lista para:
- Gestionar expedientes e indicios
- Control de flujo de estados
- Autenticación segura con JWT
- Control de roles y permisos
- Auditoría completa en la base de datos

**¡Mucho éxito con tu prueba técnica! 🚀**

---

**Notas importantes:**
- La API usa procedimientos almacenados para toda la lógica de negocio
- Las contraseñas se hashean con bcrypt (más seguro que SHA2_256)
- Todos los cambios se auditan automáticamente en las tablas de bitácora
- Swagger permite probar la API sin necesidad de Postman
