// generar-hash-admin.js
// Script para generar el hash correcto para la contraseña "pass"

const bcrypt = require('bcryptjs');

console.log('='.repeat(70));
console.log('GENERANDO HASH PARA CONTRASEÑA "pass"');
console.log('='.repeat(70));

const password = 'pass';

// Generar hash de forma sincrónica para obtener resultado inmediato
const hash = bcrypt.hashSync(password, 10);

console.log('\n✓ Hash generado exitosamente!\n');
console.log('Contraseña:', password);
console.log('Hash:', hash);
console.log('Longitud:', hash.length);

// Verificar inmediatamente que funciona
const isValid = bcrypt.compareSync(password, hash);
console.log('\n✓ Verificación:', isValid ? 'FUNCIONA CORRECTAMENTE ✓' : 'ERROR ✗');

console.log('\n' + '='.repeat(70));
console.log('EJECUTA ESTE SQL EN SQL SERVER MANAGEMENT STUDIO:');
console.log('='.repeat(70));
console.log(`
USE DB_DICRI;
GO

UPDATE Tbl_Usuario
SET password_hash = '${hash}'
WHERE id_usuario = 1;
GO

-- Verificar
SELECT 
    usuario_login,
    password_hash,
    LEN(password_hash) AS longitud,
    estado
FROM Tbl_Usuario
WHERE id_usuario = 1;
GO
`);
console.log('='.repeat(70));

// Probar con el hash que está en la BD actualmente
const hashEnBD = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
console.log('\nVERIFICANDO HASH ACTUAL EN BD:');
console.log('Hash en BD:', hashEnBD);
console.log('¿Funciona con "pass"?:', bcrypt.compareSync('pass', hashEnBD) ? 'SÍ ✓' : 'NO ✗');
console.log('\n' + '='.repeat(70));
