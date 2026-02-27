const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('=============================================');
console.log('🤖 Configuración Segura de Variables (Local)');
console.log('=============================================\n');

rl.question('Pega aquí tu nueva GEMINI_API_KEY: ', (geminiKey) => {
    if (!geminiKey.trim()) {
        console.log('❌ Error: No ingresaste ninguna clave.');
        rl.close();
        return;
    }

    const envContent = `# Archivo auto-generado para desarrollo local\nGEMINI_API_KEY=${geminiKey.trim()}\n`;

    fs.writeFile('.env.local', envContent, (err) => {
        if (err) {
            console.error('❌ Error fatal al crear el archivo .env.local:', err);
        } else {
            console.log('\n✅ ¡Éxito! Tu archivo .env.local ha sido creado de forma segura.');
            console.log('Tu servidor local (npm run dev) ahora usará esta clave automáticamente.');
            console.log('Recuerda que este archivo está protegido y NO se subirá a tu GitHub.');
        }
        rl.close();
    });
});
