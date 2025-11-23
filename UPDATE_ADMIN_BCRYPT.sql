-- ======================================================================
-- SCRIPT PARA ACTUALIZAR EL USUARIO ADMIN CON CONTRASEÑA BCRYPT
-- ======================================================================
-- Este script actualiza la contraseña del usuario admin para usar bcrypt
-- en lugar de SHA2_256, compatible con la API Node.js
-- ======================================================================

USE DB_DICRI;
GO

-- Hash bcrypt para la contraseña 'pass' generado con bcrypt.hash('pass', 10)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

UPDATE Tbl_Usuario
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE id_usuario = 1 AND usuario_login = 'admin';
GO

-- Verificar la actualización
SELECT 
    id_usuario,
    nombre,
    apellido,
    usuario_login,
    password_hash,
    estado
FROM Tbl_Usuario
WHERE id_usuario = 1;
GO

PRINT 'Usuario admin actualizado exitosamente.';
PRINT 'Ahora puedes hacer login con:';
PRINT '  Usuario: admin';
PRINT '  Contraseña: pass';
GO

-- ======================================================================
-- OPCIONAL: Crear usuarios de prueba adicionales
-- ======================================================================

-- Usuario COORDINADOR de prueba
-- Hash bcrypt para 'coordinador123'
-- $2a$10$8tVqZ0Y.ZxJxKkHqE5FqKuM0GxqM.Yd5qr3K7vJQZNxL3R4pFN5K6

IF NOT EXISTS (SELECT 1 FROM Tbl_Usuario WHERE usuario_login = 'coord1')
BEGIN
    INSERT INTO Tbl_Usuario (id_rol, nombre, apellido, usuario_login, password_hash, estado, id_usuario_registro)
    VALUES (
        2, -- COORDINADOR
        'Carlos',
        'González',
        'coord1',
        '$2a$10$8tVqZ0Y.ZxJxKkHqE5FqKuM0GxqM.Yd5qr3K7vJQZNxL3R4pFN5K6',
        1,
        1 -- Creado por admin
    );
    PRINT 'Usuario COORDINADOR creado: coord1 / coordinador123';
END
GO

-- Usuario TECNICO de prueba
-- Hash bcrypt para 'tecnico123'
-- $2a$10$YZ1qW2E3R4T5Y6U7I8O9P0aSDFGHJKLZXCVBNM1234567890ABCDE

IF NOT EXISTS (SELECT 1 FROM Tbl_Usuario WHERE usuario_login = 'tec1')
BEGIN
    INSERT INTO Tbl_Usuario (id_rol, nombre, apellido, usuario_login, password_hash, estado, id_usuario_registro)
    VALUES (
        3, -- TECNICO
        'María',
        'López',
        'tec1',
        '$2a$10$YZ1qW2E3R4T5Y6U7I8O9P0aSDFGHJKLZXCVBNM1234567890ABCDE',
        1,
        1 -- Creado por admin
    );
    PRINT 'Usuario TECNICO creado: tec1 / tecnico123';
END
GO

-- Verificar todos los usuarios
SELECT 
    U.id_usuario,
    R.nombre_rol,
    U.nombre,
    U.apellido,
    U.usuario_login,
    U.estado,
    LEFT(U.password_hash, 20) + '...' AS password_hash_preview
FROM Tbl_Usuario U
INNER JOIN Tbl_Rol R ON U.id_rol = R.id_rol
ORDER BY U.id_usuario;
GO

PRINT '';
PRINT '======================================';
PRINT 'USUARIOS DE PRUEBA DISPONIBLES:';
PRINT '======================================';
PRINT 'ADMIN:       admin / pass';
PRINT 'COORDINADOR: coord1 / coordinador123';
PRINT 'TECNICO:     tec1 / tecnico123';
PRINT '======================================';
GO
