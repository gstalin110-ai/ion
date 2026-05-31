// sogyTweb - Script para desplegar frontend en Vercel automáticamente
// Este script usa la API de Vercel para crear el proyecto

const https = require('https');
const { execSync } = require('child_process');

// Necesitamos el token de Vercel - el usuario debe proporcionarlo
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const VERCEL_API_URL = 'https://api.vercel.com';

// Función para hacer peticiones a la API de Vercel
function vercelRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${VERCEL_API_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
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

// Crear proyecto en Vercel
async function createVercelProject() {
  console.log('🚀 Creando proyecto en Vercel...');
  
  const projectConfig = {
    name: 'ion',
    framework: 'vite',
    rootDirectory: 'frontend',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install',
    devCommand: 'npm run dev',
    gitRepository: {
      type: 'github',
      repo: 'gstalin110-ai/ion',
    },
  };

  try {
    const result = await vercelRequest('POST', '/v9/projects', projectConfig);
    console.log('✅ Proyecto creado en Vercel:', result.name);
    return result;
  } catch (error) {
    console.error('❌ Error creando proyecto:', error.message);
    throw error;
  }
}

// Obtener proyectos existentes
async function getVercelProjects() {
  try {
    const result = await vercelRequest('GET', '/v9/projects');
    return result;
  } catch (error) {
    console.error('❌ Error obteniendo proyectos:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🎯 Desplegando frontend en Vercel...\n');

  if (!VERCEL_TOKEN) {
    console.log('❌ No se encontró token de Vercel');
    console.log('📋 Por favor, configura la variable de entorno VERCEL_TOKEN');
    console.log('📋 O usa la CLI de Vercel: vercel login && vercel --prod');
    process.exit(1);
  }

  try {
    // Verificar proyectos existentes
    console.log('📋 Verificando proyectos existentes...');
    const projects = await getVercelProjects();
    console.log(`✅ Encontrados ${projects.length || 0} proyectos`);

    // Crear proyecto
    const project = await createVercelProject();
    
    console.log('\n🎉 Proyecto creado exitosamente!');
    console.log('📋 Pasos siguientes:');
    console.log('1. Ve a Vercel para ver el deploy');
    console.log('2. Configura las variables de entorno si es necesario');
    console.log('3. Espera a que el deploy termine');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.log('\n📋 Alternativa: Usa la CLI de Vercel');
    console.log('   cd frontend');
    console.log('   vercel login');
    console.log('   vercel --prod');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { vercelRequest, createVercelProject, getVercelProjects };
