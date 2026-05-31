// sogyTweb - Script para ejecutar migraciones automáticamente en Render
// Este script usa la API de Render para ejecutar comandos en el shell

const https = require('https');

const RENDER_API_KEY = 'rnd_WjG2sa6PxppqN21SkSymxwVwrmNH';
const RENDER_API_URL = 'https://api.render.com/v1';

// Función para hacer peticiones a la API de Render
function renderRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${RENDER_API_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Obtener todos los servicios
async function getServices() {
  try {
    const result = await renderRequest('GET', '/services');
    return result;
  } catch (error) {
    console.error('❌ Error obteniendo servicios:', error.message);
    throw error;
  }
}

// Buscar el servicio backend
async function findBackendService() {
  console.log('🔍 Buscando servicio backend...');
  const services = await getServices();
  
  if (!services || !Array.isArray(services)) {
    console.log('❌ No se encontraron servicios');
    return null;
  }

  const backendService = services.find(s => 
    s.name === 'sogytweb-backend' || 
    s.service?.name === 'sogytweb-backend'
  );

  if (backendService) {
    console.log('✅ Servicio backend encontrado:', backendService.name || backendService.service?.name);
    return backendService;
  }

  console.log('❌ Servicio backend no encontrado');
  console.log('Servicios disponibles:', services.map(s => s.name || s.service?.name));
  return null;
}

// Ejecutar comando en el shell del servicio
async function executeShellCommand(serviceId, command) {
  console.log(`🔄 Ejecutando: ${command}`);
  
  try {
    // Render API no tiene endpoint directo para shell, necesitamos usar otra estrategia
    // Vamos a crear un script temporal que se ejecute durante el deploy
    console.log('⚠️  La API de Render no permite ejecutar comandos shell directamente');
    console.log('📋 Necesitamos usar una alternativa...');
    
    return { success: false, message: 'API limitation' };
  } catch (error) {
    console.error('❌ Error ejecutando comando:', error.message);
    throw error;
  }
}

// Crear script de migración que se ejecute en el deploy
async function createMigrationScript() {
  console.log('📝 Creando script de migración para deploy...');
  
  // Crear un script que se ejecute automáticamente en el package.json
  const packageJsonPath = './app/package.json';
  const fs = require('fs');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Agregar script de migración al postinstall
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts.postinstall = 'node scripts/migrate.js && node create_admin_user.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Script de migración agregado a package.json');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creando script:', error.message);
    return { success: false, error: error.message };
  }
}

// Función principal
async function main() {
  console.log('🎯 Ejecutando migraciones automáticamente en Render...\n');

  try {
    // Buscar servicio backend
    const service = await findBackendService();
    
    if (!service) {
      console.log('\n❌ No se pudo encontrar el servicio backend');
      console.log('📋 Por favor, verifica que el servicio se llame "sogytweb-backend"');
      process.exit(1);
    }

    // Crear script de migración
    const scriptResult = await createMigrationScript();
    
    if (scriptResult.success) {
      console.log('\n✅ Script de migración configurado');
      console.log('📋 El script se ejecutará automáticamente en el próximo deploy');
      console.log('\n🔄 Para activar las migraciones:');
      console.log('1. Haz un push a GitHub con los cambios');
      console.log('2. Render detectará el cambio y hará redeploy');
      console.log('3. Las migraciones se ejecutarán automáticamente');
    }

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { renderRequest, getServices, findBackendService, executeShellCommand };
