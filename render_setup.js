// sogyTweb - Script para configurar Render automáticamente
// Este script usa la API de Render para crear el backend y base de datos

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

// Crear base de datos PostgreSQL
async function createDatabase() {
  console.log('🗄️  Creando base de datos PostgreSQL...');
  
  const dbConfig = {
    name: 'sogytweb-db',
    databaseName: 'sogytweb',
    user: 'sogytweb',
    region: 'oregon',
    plan: 'free',
  };

  try {
    const result = await renderRequest('POST', '/services', dbConfig);
    console.log('✅ Base de datos creada:', result.service?.name);
    return result;
  } catch (error) {
    console.error('❌ Error creando base de datos:', error.message);
    throw error;
  }
}

// Crear servicio web (backend)
async function createBackendService(githubRepo, dbUrl) {
  console.log('🚀 Creando servicio web (backend)...');
  
  const serviceConfig = {
    name: 'sogytweb-backend',
    service: {
      type: 'web',
      env: 'node',
      buildCommand: 'npm install',
      startCommand: 'npm start',
      envVars: [
        {
          key: 'NODE_ENV',
          value: 'production',
        },
        {
          key: 'PORT',
          value: '5000',
        },
        {
          key: 'DATABASE_URL',
          value: dbUrl,
        },
        {
          key: 'JWT_SECRET',
          generateValue: true,
        },
      ],
    },
    repo: githubRepo,
    rootDir: 'app',
    region: 'oregon',
    plan: 'free',
  };

  try {
    const result = await renderRequest('POST', '/services', serviceConfig);
    console.log('✅ Servicio backend creado:', result.service?.name);
    return result;
  } catch (error) {
    console.error('❌ Error creando servicio backend:', error.message);
    throw error;
  }
}

// Obtener servicios existentes
async function getServices() {
  try {
    const result = await renderRequest('GET', '/services');
    return result;
  } catch (error) {
    console.error('❌ Error obteniendo servicios:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🎯 Configurando sogyTweb en Render...\n');

  try {
    // Verificar servicios existentes
    console.log('📋 Verificando servicios existentes...');
    const services = await getServices();
    console.log(`✅ Encontrados ${services.length || 0} servicios\n`);

    // Crear base de datos
    const db = await createDatabase();
    console.log('📊 Base de datos URL:', db.service?.connectionUrl || 'Pendiente de creación...\n');

    // Esperar a que la base de datos esté lista
    console.log('⏳ Esperando a que la base de datos esté lista...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('\n🎉 Configuración completada!');
    console.log('\n📋 Pasos siguientes:');
    console.log('1. Copia la URL de la base de datos');
    console.log('2. Configura las variables de entorno en el backend');
    console.log('3. Ejecuta las migraciones');
    console.log('4. Crea el usuario admin');

  } catch (error) {
    console.error('\n❌ Error en la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { renderRequest, createDatabase, createBackendService, getServices };
