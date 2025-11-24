// test-endpoints.js
// Script para probar los endpoints de actualización

async function testEndpoints() {
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

        // TEST 1: Cambiar rol del usuario 2
        console.log('='.repeat(70));
        console.log('TEST 1: Cambiar rol de usuario 2 a COORDINADOR (id_rol: 2)');
        console.log('='.repeat(70));
        
        const updateRolResponse = await fetch('http://localhost:4000/api/users/2', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_rol: 2
            })
        });

        console.log('Status:', updateRolResponse.status, updateRolResponse.statusText);
        const updateRolData = await updateRolResponse.json();
        console.log('Respuesta:', JSON.stringify(updateRolData, null, 2));

        // TEST 2: Toggle estado automático - Primera vez (debería desactivar)
        console.log('\n' + '='.repeat(70));
        console.log('TEST 2: Toggle estado del usuario 2 (sin body)');
        console.log('='.repeat(70));
        
        const toggleEstadoResponse = await fetch('http://localhost:4000/api/users/2/toggle-estado', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
            // SIN BODY - Toggle automático
        });

        console.log('Status:', toggleEstadoResponse.status, toggleEstadoResponse.statusText);
        const toggleEstadoText = await toggleEstadoResponse.text();
        console.log('Respuesta:', toggleEstadoText);

        // TEST 2B: Toggle estado automático - Segunda vez (debería activar)
        console.log('\n' + '='.repeat(70));
        console.log('TEST 2B: Toggle estado nuevamente (debería revertir)');
        console.log('='.repeat(70));
        
        const activarResponse = await fetch('http://localhost:4000/api/users/2/toggle-estado', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
            // SIN BODY - Toggle automático
        });

        console.log('Status:', activarResponse.status, activarResponse.statusText);
        const activarText = await activarResponse.text();
        console.log('Respuesta:', activarText);

        // TEST 3: Verificar el usuario actualizado
        console.log('\n' + '='.repeat(70));
        console.log('TEST 3: Verificar usuario actualizado (GET /users)');
        console.log('='.repeat(70));
        
        const getUsersResponse = await fetch('http://localhost:4000/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const users = await getUsersResponse.json();
        const user2 = users.find(u => u.id_usuario === 2);
        
        if (user2) {
            console.log('\nUsuario 2 después de los cambios:');
            console.log('- Nombre:', user2.nombre);
            console.log('- Rol:', user2.nombre_rol);
            console.log('- id_rol:', user2.id_rol);
            console.log('- Estado:', user2.estado);
            console.log('- Activo:', user2.activo);
        } else {
            console.log('❌ Usuario 2 no encontrado');
        }

        console.log('\n' + '='.repeat(70));
        console.log('PRUEBAS COMPLETADAS');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

testEndpoints();
