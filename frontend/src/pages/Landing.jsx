import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShoppingBag, Users, TrendingUp, Shield, Zap, Heart, Star, Check } from 'lucide-react'
import { useState } from 'react'

const Landing = () => {
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Marketplace Inteligente',
      description: 'Compra y vende productos con IA que te recomienda lo que realmente necesitas'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Red Social Integrada',
      description: 'Conecta con personas que comparten tus intereses, comparte momentos y crea comunidad'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'IA ion Avanzada',
      description: 'Asistente inteligente que te ayuda a crear contenido, automatizar tareas y tomar decisiones'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Sistema Financiero',
      description: 'Billetera integrada, pagos seguros y sistema de afiliados para monetizar tu contenido'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad Elite',
      description: 'Protección de datos de nivel bancario con encriptación end-to-end y autenticación 2FA'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Streaming en Vivo',
      description: 'Lives, stories y grupos para compartir experiencias en tiempo real'
    }
  ]

  const stats = [
    { value: '10M+', label: 'Usuarios Activos' },
    { value: '50M+', label: 'Transacciones' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'Rating' }
  ]

  const testimonials = [
    {
      name: 'María García',
      role: 'Emprendedora',
      content: 'sogyTweb transformó mi negocio. El sistema de afiliados y la IA me ayudaron a aumentar mis ventas en un 300%.',
      avatar: 'MG'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Creador de Contenido',
      content: 'La mejor plataforma para conectar con mi audiencia. Las lives y el sistema de notificaciones son increíbles.',
      avatar: 'CR'
    },
    {
      name: 'Ana Martínez',
      role: 'Desarrolladora',
      content: 'La API es excelente y la documentación es clara. Integré sogyTweb en mi proyecto en menos de una semana.',
      avatar: 'AM'
    }
  ]

  const benefits = [
    'Sin comisiones ocultas',
    'Soporte 24/7 en español',
    'Actualizaciones constantes',
    'Comunidad activa',
    'Tutorial completo',
    'Garantía de satisfacción'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full mb-8 animate-bounce-in">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">El Ecosistema Digital del Futuro</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                sogyTweb
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              El ecosistema digital más completo del mundo. Marketplace, red social, IA inteligente y finanzas en una sola plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="btn-primary px-8 py-4 text-lg flex items-center space-x-2">
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-4 text-lg">
                Iniciar Sesión
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Características que te Encantarán
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Todo lo que necesitas en una sola plataforma, diseñado para simplificar tu vida digital
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Lo que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Únete a millones de usuarios que ya confían en sogyTweb
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card p-8 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para Transformar tu Experiencia Digital?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Únete hoy y obtén acceso gratuito a todas las características premium durante 30 días
          </p>

          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl font-bold mb-6">Beneficios Exclusivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <Link to="/register" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Comenzar Ahora - Es Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">sogyTweb</span>
              </div>
              <p className="text-gray-400">
                El ecosistema digital más completo del mundo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compañía</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Carreras</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 sogyTweb. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
