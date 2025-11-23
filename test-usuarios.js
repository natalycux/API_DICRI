// test-usuarios.js
// Script para probar la respuesta del endpoint GET /users

async function testUsuarios() {
    try {
        console.log('1. Haciendo login...');
        const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_login: 'admin',
                password_plano: 'pass'
            })
        });

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✓ Login exitoso\n');

        console.log('2. Obteniendo usuarios...');
        const usuariosResponse = await fetch('http://localhost:4000/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const usuarios = await usuariosResponse.json();

        console.log('\n' + '='.repeat(70));
        console.log('RESPUESTA DE GET /api/users:');
        console.log('='.repeat(70));
        console.log(JSON.stringify(usuarios, null, 2));
        console.log('='.repeat(70));

        // Verificar el campo 'activo'
        console.log('\n📊 ANÁLISIS DE USUARIOS:');
        usuarios.forEach((user, index) => {
            console.log(`\nUsuario ${index + 1}:`);
            console.log(`  - id_usuario: ${user.id_usuario}`);
            console.log(`  - nombre: ${user.nombre}`);
            console.log(`  - usuario_login: ${user.usuario_login}`);
            console.log(`  - estado (BD): ${user.estado}`);
            console.log(`  - activo (Frontend): ${user.activo}`);
            console.log(`  - Todos los campos:`, Object.keys(user));
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testUsuarios();
