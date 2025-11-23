// test-bcrypt.js
// Script para generar y verificar hashes bcrypt

const bcrypt = require('bcryptjs');

console.log('='.repeat(60));
console.log('GENERADOR Y VERIFICADOR DE HASHES BCRYPT');
console.log('='.repeat(60));

// Contraseña a probar
const password = 'pass';

// Hash que debería estar en la BD
const expectedHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

console.log('\n1. GENERANDO NUEVO HASH PARA "pass":');
console.log('-'.repeat(60));

// Generar un nuevo hash
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error generando hash:', err);
        return;
    }
    
    console.log('Contraseña:', password);
    console.log('Nuevo Hash generado:', hash);
    console.log('Longitud:', hash.length, 'caracteres');
    
    // Verificar que el nuevo hash funciona
    bcrypt.compare(password, hash, (err, result) => {
        if (err) {
            console.error('Error comparando:', err);
            return;
        }
        console.log('✓ El nuevo hash funciona:', result ? 'SÍ ✓' : 'NO ✗');
    });
});

console.log('\n2. VERIFICANDO HASH ESPERADO:');
console.log('-'.repeat(60));
console.log('Hash esperado:', expectedHash);
console.log('Longitud:', expectedHash.length, 'caracteres');

// Verificar el hash esperado
bcrypt.compare(password, expectedHash, (err, result) => {
    if (err) {
        console.error('Error comparando:', err);
        return;
    }
    console.log('✓ Hash esperado es válido para "pass":', result ? 'SÍ ✓' : 'NO ✗');
    
    if (result) {
        console.log('\n' + '='.repeat(60));
        console.log('✓✓✓ EL HASH ES CORRECTO ✓✓✓');
        console.log('='.repeat(60));
        console.log('\nUSA ESTE HASH EN SQL SERVER:');
        console.log(expectedHash);
        console.log('\nSQL PARA ACTUALIZAR:');
        console.log("UPDATE Tbl_Usuario");
        console.log("SET password_hash = '" + expectedHash + "'");
        console.log("WHERE id_usuario = 1;");
        console.log('='.repeat(60));
    } else {
        console.log('\n' + '='.repeat(60));
        console.log('✗✗✗ EL HASH NO ES VÁLIDO ✗✗✗');
        console.log('='.repeat(60));
    }
});

console.log('\n3. PROBANDO DIFERENTES CONTRASEÑAS:');
console.log('-'.repeat(60));

// Probar otras contraseñas comunes por si acaso
const testPasswords = ['admin', 'Admin', 'PASS', 'Pass', '123456', 'password'];

testPasswords.forEach(testPass => {
    bcrypt.compare(testPass, expectedHash, (err, result) => {
        if (err) return;
        if (result) {
            console.log(`✓ "${testPass}" coincide con el hash`);
        }
    });
});

// Dar tiempo para que se completen las operaciones asíncronas
setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('DIAGNÓSTICO COMPLETADO');
    console.log('='.repeat(60));
    process.exit(0);
}, 2000);
