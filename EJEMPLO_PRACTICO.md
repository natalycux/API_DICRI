# 🚀 EJEMPLO PRÁCTICO - Flujo Completo de Trabajo

Este documento te guiará paso a paso en un flujo completo de trabajo con la API DICRI, desde el login hasta la aprobación de un expediente.

---

## 📋 Prerrequisitos

1. ✅ SQL Server corriendo
2. ✅ Base de datos DB_DICRI creada
3. ✅ Script `UPDATE_ADMIN_BCRYPT.sql` ejecutado
4. ✅ Servidor API corriendo en puerto 4000
5. ✅ Swagger abierto en: http://localhost:4000/api-docs

---

## 🎯 Escenario: Proceso Completo de un Expediente

**Historia**: Un técnico crea un expediente de robo, agrega evidencia, y lo envía a revisión. El coordinador lo revisa y aprueba.

---

## 🔷 PASO 1: Login como ADMIN

### Objetivo
Crear los usuarios necesarios para el flujo (Coordinador y Técnico).

### Acción en Swagger

1. Ir a la sección **Autenticación**
2. Expandir `POST /auth/login`
3. Click en **"Try it out"**
4. Ingresar:

```json
{
  "usuario_login": "admin",
  "password_plano": "pass"
}
```

5. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Login exitoso",
  "user": {
    "id_usuario": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "rol": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoiQURNSU4iLCJpYXQiOjE3MDA2NzAwMDAsImV4cCI6MTcwMDY5ODgwMH0.abc123..."
}
```

### ⚠️ IMPORTANTE
**Copiar el token** y hacer clic en **"Authorize"** (candado verde) arriba.

Ingresar: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔷 PASO 2: Crear Usuario COORDINADOR

### Acción en Swagger

1. Ir a la sección **Usuarios**
2. Expandir `POST /users`
3. Click en **"Try it out"**
4. Ingresar:

```json
{
  "id_rol": 2,
  "nombre": "Carlos",
  "apellido": "González",
  "usuario_login": "cgonzalez",
  "password_plano": "coord123",
  "estado": true
}
```

5. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Usuario creado exitosamente",
  "id_usuario": 2
}
```

---

## 🔷 PASO 3: Crear Usuario TECNICO

### Acción en Swagger

1. En la misma sección **Usuarios**
2. `POST /users` → **"Try it out"**
3. Ingresar:

```json
{
  "id_rol": 3,
  "nombre": "María",
  "apellido": "López",
  "usuario_login": "mlopez",
  "password_plano": "tecnico123",
  "estado": true
}
```

4. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Usuario creado exitosamente",
  "id_usuario": 3
}
```

---

## 🔷 PASO 4: Login como TECNICO

### Acción en Swagger

1. Volver a **Autenticación**
2. `POST /auth/login` → **"Try it out"**
3. Ingresar:

```json
{
  "usuario_login": "mlopez",
  "password_plano": "tecnico123"
}
```

4. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Login exitoso",
  "user": {
    "id_usuario": 3,
    "nombre": "María",
    "apellido": "López",
    "rol": "TECNICO"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sIjoiVEVDTklDTyIsImlhdCI6MTcwMDY3MDAwMCwiZXhwIjoxNzAwNjk4ODAwfQ.xyz789..."
}
```

### ⚠️ IMPORTANTE
**Actualizar el token** en **"Authorize"** con el nuevo token del técnico.

---

## 🔷 PASO 5: Obtener Catálogos Geográficos

### Objetivo
Ver las fiscalías disponibles para asignar al expediente.

### Acción en Swagger

1. Ir a **Catálogos**
2. `GET /catalogos/geograficos` → **"Execute"**

### Respuesta Esperada

```json
{
  "departamentos": [
    {
      "id_departamento": 1,
      "nombre_departamento": "Guatemala"
    }
  ],
  "municipios": [
    {
      "id_municipio": 1,
      "id_departamento": 1,
      "nombre_municipio": "Guatemala (Ciudad)"
    }
  ],
  "fiscalias": [
    {
      "id_fiscalia": 1,
      "id_municipio": 1,
      "nombre_fiscalia": "Central de Delitos Comunes"
    }
  ]
}
```

**Anotar**: `id_fiscalia: 1` para usar en el expediente.

---

## 🔷 PASO 6: Crear Expediente

### Acción en Swagger

1. Ir a **Expedientes**
2. `POST /expedientes` → **"Try it out"**
3. Ingresar:

```json
{
  "codigo_expediente": "DICRI-2025-001",
  "id_fiscalia": 1,
  "descripcion_corta": "Robo agravado en vivienda particular, Zona 1, Ciudad de Guatemala. Se encontraron múltiples indicios en la escena del crimen.",
  "ruta_archivo_pdf": "/documentos/2025/001/informe_inicial.pdf"
}
```

4. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Expediente creado exitosamente en estado BORRADOR.",
  "id_expediente": 1
}
```

**Anotar**: `id_expediente: 1`

---

## 🔷 PASO 7: Agregar Primer Indicio

### Acción en Swagger

1. En **Expedientes**
2. `POST /expedientes/{id}/indicios`
3. En `id` ingresar: `1`
4. Click **"Try it out"**
5. Ingresar:

```json
{
  "nombre_objeto": "Arma de fuego calibre 9mm",
  "descripcion": "Pistola semiautomática marca Glock modelo 17, acabado negro mate, número de serie GH45823",
  "color": "Negro",
  "tamano": "18cm x 13cm x 3cm",
  "peso": 0.65,
  "ubicacion_en_escena": "Sala principal, debajo del sofá color café"
}
```

6. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Indicio agregado al expediente exitosamente.",
  "id_indicio": 1
}
```

---

## 🔷 PASO 8: Agregar Segundo Indicio

### Acción en Swagger

Repetir el proceso anterior con:

```json
{
  "nombre_objeto": "Casquillos de bala",
  "descripcion": "5 casquillos percutidos calibre 9mm Parabellum, marca Remington",
  "color": "Dorado",
  "ubicacion_en_escena": "Piso de la sala, dispersos cerca de la puerta principal"
}
```

### Respuesta Esperada

```json
{
  "message": "Indicio agregado al expediente exitosamente.",
  "id_indicio": 2
}
```

---

## 🔷 PASO 9: Agregar Tercer Indicio

```json
{
  "nombre_objeto": "Huellas dactilares latentes",
  "descripcion": "Múltiples impresiones dactilares localizadas en superficies lisas, levantadas con polvo negro",
  "ubicacion_en_escena": "Manija de puerta principal y marco de ventana de la sala"
}
```

---

## 🔷 PASO 10: Ver Detalle del Expediente

### Acción en Swagger

1. `GET /expedientes/{id}`
2. En `id` ingresar: `1`
3. Click **"Execute"**

### Respuesta Esperada

```json
{
  "datos_principales": {
    "id_expediente": 1,
    "codigo_expediente": "DICRI-2025-001",
    "id_estado": 1,
    "nombre_estado": "BORRADOR",
    "id_fiscalia": 1,
    "nombre_fiscalia": "Central de Delitos Comunes",
    "nombre_municipio": "Guatemala (Ciudad)",
    "nombre_departamento": "Guatemala",
    "descripcion_corta": "Robo agravado en vivienda particular...",
    "ruta_archivo_pdf": "/documentos/2025/001/informe_inicial.pdf",
    "nombre_usuario_registro": "María López",
    "fecha_registro": "2025-11-22T10:30:00.000Z"
  },
  "indicios": [
    {
      "id_indicio": 1,
      "nombre_objeto": "Arma de fuego calibre 9mm",
      "descripcion": "Pistola semiautomática marca Glock...",
      "color": "Negro",
      "tamano": "18cm x 13cm x 3cm",
      "peso": 0.65,
      "ubicacion_en_escena": "Sala principal, debajo del sofá...",
      "usuario_registro": "María López",
      "fecha_registro": "2025-11-22T10:35:00.000Z"
    },
    {
      "id_indicio": 2,
      "nombre_objeto": "Casquillos de bala",
      ...
    },
    {
      "id_indicio": 3,
      "nombre_objeto": "Huellas dactilares latentes",
      ...
    }
  ],
  "historial_estado": [
    {
      "id_historial": 1,
      "estado_anterior": null,
      "estado_nuevo": "BORRADOR",
      "usuario_accion": "María López",
      "fecha_accion": "2025-11-22T10:30:00.000Z"
    }
  ]
}
```

---

## 🔷 PASO 11: Enviar a Revisión (Cambiar Estado)

### Acción en Swagger

1. `PUT /expedientes/{id}/estado`
2. En `id` ingresar: `1`
3. Click **"Try it out"**
4. Ingresar:

```json
{
  "id_estado_nuevo": 2
}
```

5. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Estado del Expediente 1 actualizado a ID 2.",
  "id_expediente_actualizado": 1
}
```

**Ahora el expediente está EN_REVISION** ✅

---

## 🔷 PASO 12: Login como COORDINADOR

### Acción en Swagger

1. Volver a **Autenticación**
2. `POST /auth/login` → **"Try it out"**
3. Ingresar:

```json
{
  "usuario_login": "cgonzalez",
  "password_plano": "coord123"
}
```

4. Click **"Execute"**
5. **Copiar el nuevo token**
6. Click **"Authorize"** y actualizar con el token del coordinador

---

## 🔷 PASO 13: Ver Expedientes en Revisión

### Acción en Swagger

1. `GET /expedientes`
2. En **Parameters**, agregar:
   - `id_estado`: `2`
3. Click **"Execute"**

### Respuesta Esperada

```json
[
  {
    "id_expediente": 1,
    "codigo_expediente": "DICRI-2025-001",
    "descripcion_corta": "Robo agravado en vivienda particular...",
    "fecha_registro": "2025-11-22T10:30:00.000Z",
    "id_estado": 2,
    "estado_actual": "EN_REVISION",
    "nombre_fiscalia": "Central de Delitos Comunes",
    "nombre_municipio": "Guatemala (Ciudad)",
    "nombre_departamento": "Guatemala",
    "tecnico_registro": "María López",
    "rol_registro": "TECNICO",
    "usuario_ultima_actualizacion": "María López",
    "fecha_ultima_actualizacion": "2025-11-22T10:45:00.000Z"
  }
]
```

---

## 🔷 PASO 14: Ver Detalle Antes de Aprobar

### Acción en Swagger

1. `GET /expedientes/{id}`
2. En `id` ingresar: `1`
3. Click **"Execute"**
4. **Revisar todos los indicios y detalles**

---

## 🔷 PASO 15: Aprobar el Expediente

### Acción en Swagger

1. `PUT /expedientes/{id}/estado`
2. En `id` ingresar: `1`
3. Click **"Try it out"**
4. Ingresar:

```json
{
  "id_estado_nuevo": 3
}
```

5. Click **"Execute"**

### Respuesta Esperada

```json
{
  "message": "Estado del Expediente 1 actualizado a ID 3.",
  "id_expediente_actualizado": 1
}
```

**¡Expediente APROBADO!** ✅🎉

---

## 🔷 PASO 16 (OPCIONAL): Ver Conteo por Estados

### Acción en Swagger

1. `GET /expedientes/conteo`
2. Click **"Execute"**

### Respuesta Esperada

```json
[
  {
    "id_estado": 1,
    "nombre_estado": "BORRADOR",
    "total": 0
  },
  {
    "id_estado": 2,
    "nombre_estado": "EN_REVISION",
    "total": 0
  },
  {
    "id_estado": 3,
    "nombre_estado": "APROBADO",
    "total": 1
  },
  {
    "id_estado": 4,
    "nombre_estado": "RECHAZADO",
    "total": 0
  }
]
```

---

## 🔷 PASO 17 (ALTERNATIVO): Rechazar un Expediente

Si en lugar de aprobar, el coordinador rechaza:

### Acción en Swagger

1. `PUT /expedientes/{id}/estado`
2. En `id` ingresar: `1`
3. Ingresar:

```json
{
  "id_estado_nuevo": 4,
  "justificacion": "Falta peritaje balístico completo del arma. Se requiere análisis de pólvora en manos y trayectoria de proyectiles."
}
```

### Respuesta

```json
{
  "message": "Estado del Expediente 1 actualizado a ID 4.",
  "id_expediente_actualizado": 1
}
```

**Ahora el técnico puede corregir y reenviar** ♻️

---

## 📊 Resumen del Flujo Completo

```
✅ PASO 1:  Login como ADMIN
✅ PASO 2:  Crear usuario COORDINADOR
✅ PASO 3:  Crear usuario TECNICO
✅ PASO 4:  Login como TECNICO
✅ PASO 5:  Ver catálogos disponibles
✅ PASO 6:  Crear expediente (BORRADOR)
✅ PASO 7:  Agregar indicio #1
✅ PASO 8:  Agregar indicio #2
✅ PASO 9:  Agregar indicio #3
✅ PASO 10: Ver detalle del expediente
✅ PASO 11: Enviar a revisión (EN_REVISION)
✅ PASO 12: Login como COORDINADOR
✅ PASO 13: Listar expedientes en revisión
✅ PASO 14: Ver detalle para revisar
✅ PASO 15: Aprobar expediente (APROBADO)
✅ PASO 16: Ver conteo por estados
```

---

## 🎯 Estados Finales

| Expediente | Estado | Usuario | Indicios |
|------------|--------|---------|----------|
| DICRI-2025-001 | APROBADO | María López (TECNICO) | 3 indicios |

---

## 💡 Notas Importantes

1. **Los tokens expiran en 8 horas** - Si trabajas por mucho tiempo, debes hacer login nuevamente

2. **No se puede editar EN_REVISION** - Si el técnico intenta editar cuando está en revisión, la API devolverá error

3. **APROBADO es final** - Una vez aprobado, no se puede cambiar el estado

4. **RECHAZADO requiere justificación** - Si no se proporciona, la API devuelve error

5. **Auditoría automática** - Todos los cambios se registran en las tablas de bitácora automáticamente mediante triggers

---

## 🔍 Verificación en la Base de Datos

Puedes verificar los datos directamente en SQL Server:

```sql
-- Ver el expediente
SELECT * FROM Tbl_Expediente WHERE id_expediente = 1;

-- Ver los indicios
SELECT * FROM Tbl_DetalleIndicio WHERE id_expediente = 1;

-- Ver el historial de estados
SELECT * FROM Tbl_HistorialEstadoExpediente WHERE id_expediente = 1;

-- Ver la bitácora de auditoría
SELECT * FROM Tbl_BitacoraExpediente WHERE id_expediente = 1;
SELECT * FROM Tbl_BitacoraIndicio WHERE id_expediente = 1;
```

---

## 🎉 ¡Felicitaciones!

Has completado un flujo completo de trabajo con la API DICRI:

✅ Gestión de usuarios  
✅ Creación de expedientes  
✅ Gestión de indicios  
✅ Flujo de aprobación  
✅ Control de roles y permisos  

**¡La API está completamente funcional y lista para usar!** 🚀

---

**Siguiente paso**: Explora otros endpoints en Swagger y prueba diferentes escenarios.
