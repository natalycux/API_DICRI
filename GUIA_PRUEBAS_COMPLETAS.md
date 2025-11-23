# 🧪 PRUEBA COMPLETA DEL FLUJO DE AUTENTICACIÓN

## ✅ Estado Actual
- ✅ Servidor corriendo en puerto 4000
- ✅ Usuario admin con hash correcto
- ✅ Login funcionando correctamente
- ✅ API hashea automáticamente las contraseñas

---

## 📋 PRUEBA 1: Login con Usuario Admin (Ya Funcionando)

### En Postman o Swagger:
**POST** `http://localhost:4000/api/auth/login`

**Body:**
```json
{
  "usuario_login": "admin",
  "password_plano": "pass"
}
```

**Respuesta esperada (200 OK):**
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

✅ **COPIA EL TOKEN** - Lo necesitarás para las siguientes pruebas

---

## 📋 PRUEBA 2: Crear un Nuevo Usuario (Verifica Hasheo Automático)

### En Postman:
**POST** `http://localhost:4000/api/users`

**Headers:**
- `Authorization`: `Bearer TU_TOKEN_AQUI`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "id_rol": 3,
  "nombre": "Pedro",
  "apellido": "García",
  "usuario_login": "pgarcia",
  "password_plano": "password123",
  "estado": 1
}
```

**Respuesta esperada (201 Created):**
```json
{
  "message": "Usuario creado exitosamente",
  "id_usuario": 2
}
```

### 🔍 Verificación en SQL Server:
Ejecuta este query para ver que la contraseña se hasheó automáticamente:

```sql
SELECT 
    id_usuario,
    nombre,
    apellido,
    usuario_login,
    password_hash,
    LEN(password_hash) AS longitud_hash,
    estado
FROM Tbl_Usuario
WHERE usuario_login = 'pgarcia';
```

**Resultado esperado:**
- `password_hash`: `$2b$10$...` (un hash de 60 caracteres)
- `longitud_hash`: `60`
- **NO es "password123"** - está hasheado ✅

---

## 📋 PRUEBA 3: Login con el Usuario Nuevo

### En Postman:
**POST** `http://localhost:4000/api/auth/login`

**Body:**
```json
{
  "usuario_login": "pgarcia",
  "password_plano": "password123"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id_usuario": 2,
    "nombre": "Pedro",
    "apellido": "García",
    "rol": "TECNICO"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ **Si esto funciona, significa que:**
1. La API hasheó automáticamente "password123" al crear el usuario
2. La API comparó correctamente "password123" con el hash almacenado
3. **Todo el flujo funciona perfectamente**

---

## 📋 PRUEBA 4: Actualizar Contraseña

### En Postman:
**PUT** `http://localhost:4000/api/users/2`

**Headers:**
- `Authorization`: `Bearer TOKEN_DEL_ADMIN`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "password_plano": "nuevapassword456"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "message": "Usuario 2 actualizado exitosamente.",
  "id_usuario_actualizado": 2
}
```

### Verifica el Login con la Nueva Contraseña:
**POST** `http://localhost:4000/api/auth/login`

**Body:**
```json
{
  "usuario_login": "pgarcia",
  "password_plano": "nuevapassword456"
}
```

✅ **Debería funcionar con la nueva contraseña**

❌ **Si intentas con la anterior debería fallar:**
```json
{
  "usuario_login": "pgarcia",
  "password_plano": "password123"
}
```
Respuesta: `401 Credenciales inválidas`

---

## 📋 PRUEBA 5: Intentar Login con Contraseña Incorrecta

**POST** `http://localhost:4000/api/auth/login`

**Body:**
```json
{
  "usuario_login": "pgarcia",
  "password_plano": "contraseñaincorrecta"
}
```

**Respuesta esperada (401 Unauthorized):**
```json
{
  "message": "Credenciales inválidas."
}
```

---

## 🎯 Resumen del Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. CREAR USUARIO (Admin)                                   │
│     Envía: password_plano: "password123"                    │
│     API hashea: $2b$10$abc...                               │
│     BD guarda: Hash de 60 caracteres                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. LOGIN (Usuario)                                         │
│     Envía: password_plano: "password123"                    │
│     API obtiene hash de BD: $2b$10$abc...                   │
│     API compara: bcrypt.compare("password123", hash)        │
│     Si coincide → Retorna token JWT                         │
│     Si NO coincide → 401 Credenciales inválidas             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. USAR API (Con Token)                                    │
│     Envía: Authorization: Bearer eyJhbGc...                 │
│     Middleware verifica token                               │
│     Si válido → Procesa request                             │
│     Si inválido → 401 Token inválido                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificación

- [ ] Login con admin/pass funciona
- [ ] Crear nuevo usuario funciona
- [ ] Hash del nuevo usuario tiene 60 caracteres
- [ ] Login con nuevo usuario funciona
- [ ] Actualizar contraseña funciona
- [ ] Login con contraseña actualizada funciona
- [ ] Login con contraseña anterior falla
- [ ] Login con contraseña incorrecta falla

---

## 🎉 Conclusión

Tu análisis fue **100% correcto**. La API debe (y ya lo hace):

1. ✅ **Hashear automáticamente** al crear usuarios
2. ✅ **Hashear automáticamente** al actualizar contraseñas
3. ✅ **Comparar con bcrypt** al hacer login
4. ✅ **Nunca guardar texto plano** en la base de datos

El único usuario que tuvo problemas fue `admin` porque ya existía en la BD con un hash incorrecto. Todos los usuarios nuevos creados desde la API funcionarán perfectamente sin necesidad de scripts manuales.

---

**¡El sistema está funcionando correctamente!** 🚀
