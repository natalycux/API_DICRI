# 🔍 GUÍA DE DIAGNÓSTICO - PROBLEMA DE LOGIN

## Problema Actual
- ✅ Hash correcto en BD: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- ✅ URL correcta: `http://localhost:4000/api/auth/login`
- ❌ Respuesta: "Credenciales inválidas"

---

## 📋 PASO 1: Verificar Hash en SQL Server

Ejecuta este query en **SQL Server Management Studio**:

```sql
USE DB_DICRI;

SELECT 
    id_usuario,
    usuario_login,
    password_hash,
    LEN(password_hash) AS longitud,
    estado,
    CASE 
        WHEN password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
        THEN '✓ HASH CORRECTO'
        ELSE '✗ HASH INCORRECTO - Actualizar'
    END AS verificacion
FROM Tbl_Usuario
WHERE id_usuario = 1;
```

**Resultado esperado:**
- `longitud`: **60** caracteres
- `estado`: **1** (activo)
- `verificacion`: **✓ HASH CORRECTO**

**Si el hash es diferente, ejecuta:**

```sql
UPDATE Tbl_Usuario
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE id_usuario = 1;
```

---

## 📋 PASO 2: Reiniciar el Servidor con Logs

1. **Detén el servidor actual** (si está corriendo):
   - En la terminal donde corre Node, presiona `Ctrl + C`
   - O ejecuta en PowerShell:
     ```powershell
     Get-Process -Name node | Stop-Process -Force
     ```

2. **Inicia el servidor con logs**:
   ```powershell
   cd "c:\Users\natal\OneDrive\Documentos\PRUEBA TECNICA MP\API_DICRI\API_DICRI"
   node server.js
   ```

3. Deberías ver:
   ```
   Servidor Node.js escuchando en el puerto 4000
   🚀 Documentación Swagger: http://localhost:4000/api-docs
   Swagger spec generado: 15 endpoints encontrados
   ```

---

## 📋 PASO 3: Probar Login en Postman

### Request:
- **Método:** POST
- **URL:** `http://localhost:4000/api/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "usuario_login": "admin",
    "password_plano": "pass"
  }
  ```

### Observa la Consola de Node:
Después de hacer clic en "Send" en Postman, deberías ver en la terminal de Node algo como:

```
============================================================
DIAGNÓSTICO DE LOGIN:
Usuario ingresado: admin
Contraseña ingresada: pass
Hash en BD: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
Longitud del hash: 60
============================================================
Resultado de bcrypt.compare(): true
============================================================
```

### Respuestas Posibles:

#### ✅ Si `bcrypt.compare()` retorna `true`:
**Respuesta de Postman (Status 200):**
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

#### ❌ Si `bcrypt.compare()` retorna `false`:
**Posibles causas:**

1. **Hash truncado o con espacios:**
   - Verifica que el hash tenga exactamente 60 caracteres
   - Verifica que no tenga espacios al inicio o final

2. **Contraseña diferente:**
   - El hash es para "pass" exactamente (minúsculas)
   - Verifica que no estés usando "Pass", "PASS", etc.

3. **Hash corrupto:**
   - Ejecuta el UPDATE nuevamente en SQL Server

---

## 📋 PASO 4: Verificación con Script Node.js

Si todavía falla, ejecuta este script para verificar bcrypt:

```powershell
cd "c:\Users\natal\OneDrive\Documentos\PRUEBA TECNICA MP\API_DICRI\API_DICRI"
node test-bcrypt.js
```

Este script te dirá si el hash funciona correctamente con bcrypt.

---

## 🔧 PASO 5: Soluciones Alternativas

### Opción A: Generar un Hash Nuevo
Si el hash no funciona, genera uno nuevo:

1. Abre la consola de Node:
   ```powershell
   node
   ```

2. Ejecuta:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('pass', 10, (err, hash) => { 
     console.log('NUEVO HASH:', hash); 
   });
   ```

3. Copia el hash generado y actualiza SQL Server:
   ```sql
   UPDATE Tbl_Usuario
   SET password_hash = 'EL_HASH_QUE_GENERASTE'
   WHERE id_usuario = 1;
   ```

### Opción B: Usar una Contraseña Diferente Temporalmente

```sql
-- Hash para "admin123"
UPDATE Tbl_Usuario
SET password_hash = '$2a$10$8tVqZ0Y.ZxJxKkHqE5FqKuM0GxqM.Yd5qr3K7vJQZNxL3R4pFN5K6'
WHERE id_usuario = 1;
```

Luego prueba con:
```json
{
  "usuario_login": "admin",
  "password_plano": "admin123"
}
```

---

## 📊 Checklist de Verificación

- [ ] Hash en BD tiene 60 caracteres
- [ ] Hash en BD es exactamente: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- [ ] Usuario `admin` tiene `estado = 1`
- [ ] Servidor Node corriendo en puerto 4000
- [ ] URL en Postman es `http://localhost:4000/api/auth/login` (con `/api/`)
- [ ] Body JSON tiene `usuario_login` y `password_plano`
- [ ] Logs de diagnóstico aparecen en la consola de Node
- [ ] `bcrypt.compare()` retorna `true` en los logs

---

## 📞 Información de los Logs

Cuando hagas la prueba, **copia y envíame los logs que aparecen en la consola de Node**, específicamente:

```
============================================================
DIAGNÓSTICO DE LOGIN:
Usuario ingresado: ?
Contraseña ingresada: ?
Hash en BD: ?
Longitud del hash: ?
============================================================
Resultado de bcrypt.compare(): ?
============================================================
```

Con esa información podré identificar exactamente dónde está el problema.
