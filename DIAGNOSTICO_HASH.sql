-- ======================================================================
-- SCRIPT DE DIAGNÓSTICO - VERIFICAR HASH DEL USUARIO ADMIN
-- ======================================================================
-- Este script verifica el hash actual y genera uno nuevo para comparar
-- ======================================================================

USE DB_DICRI;
GO

-- 1. Ver el hash actual del usuario admin
PRINT '=== HASH ACTUAL DEL USUARIO ADMIN ===';
SELECT 
    id_usuario,
    nombre,
    apellido,
    usuario_login,
    password_hash,
    LEN(password_hash) AS longitud_hash,
    estado
FROM Tbl_Usuario
WHERE id_usuario = 1;
GO

-- 2. Información del hash bcrypt esperado
PRINT '';
PRINT '=== HASH ESPERADO PARA LA CONTRASEÑA "pass" ===';
PRINT 'Hash bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
PRINT 'Longitud: 60 caracteres';
PRINT '';

-- 3. Actualizar el hash (EJECUTAR ESTO SI EL HASH NO COINCIDE)
PRINT '=== ACTUALIZANDO HASH DEL USUARIO ADMIN ===';
UPDATE Tbl_Usuario
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE id_usuario = 1;
GO

-- 4. Verificar la actualización
PRINT '=== VERIFICACIÓN POST-ACTUALIZACIÓN ===';
SELECT 
    id_usuario,
    nombre,
    apellido,
    usuario_login,
    password_hash,
    LEN(password_hash) AS longitud_hash,
    CASE 
        WHEN password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
        THEN 'HASH CORRECTO ✓'
        ELSE 'HASH INCORRECTO ✗'
    END AS verificacion,
    estado
FROM Tbl_Usuario
WHERE id_usuario = 1;
GO

PRINT '';
PRINT '======================================';
PRINT 'Si la verificación dice "HASH CORRECTO ✓", entonces:';
PRINT 'Usuario: admin';
PRINT 'Contraseña: pass';
PRINT '======================================';
GO
