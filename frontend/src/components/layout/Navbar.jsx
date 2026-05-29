import { Link } from 'react-router-dom'
import { Search, ShoppingBag, User, Menu, X, Sparkles, Wallet, Shield, TrendingUp, AlertTriangle, Settings, BarChart, HelpCircle, Moon, Sun, Palette, Bookmark as BookmarkIcon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationsDropdown from './NotificationsDropdown'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout, isSeller } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search logic
    console.log('Searching:', searchQuery)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              sogyTweb
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Inicio
            </Link>
            <Link to="/feed" className="text-gray-700 hover:text-primary-600 transition-colors">
              Mundo
            </Link>
            <Link to="/chat" className="text-gray-700 hover:text-primary-600 transition-colors">
              Chat
            </Link>
            <Link to="/ai" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
              <span>ion AI</span>
              <Sparkles className="w-4 h-4 text-accent-500" />
            </Link>
            <Link to="/wallet" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
              <span>Billetera</span>
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-primary-600 transition-colors">
              Categorías
            </Link>
            
            {isAuthenticated && user?.is_admin && (
              <Link to="/admin" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
            
            {isAuthenticated && user?.is_admin && (
              <Link to="/admin/config" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>Config</span>
              </Link>
            )}
            
            {isAuthenticated && (
              <Link to="/affiliate" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Afiliados</span>
              </Link>
            )}
            
            {isAuthenticated && (
              <Link to="/disputes" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Disputas</span>
              </Link>
            )}
            
            {isAuthenticated && (
              <Link to="/analytics" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <BarChart className="w-4 h-4" />
                <span>Analíticas</span>
              </Link>
            )}
            
            {isAuthenticated && (
              <Link to="/support" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <HelpCircle className="w-4 h-4" />
                <span>Soporte</span>
              </Link>
            )}
            
            {isAuthenticated && (
              <Link to="/bookmarks" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                <BookmarkIcon className="w-4 h-4" />
                <span>Favoritos</span>
              </Link>
            )}
            
            {isAuthenticated && <NotificationsDropdown />}
            
            {isAuthenticated ? (
              <>
                {isSeller && (
                  <Link to="/seller/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Mi Tienda
                  </Link>
                )}
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Mis Pedidos
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <User className="w-5 h-5" />
                    <span>{user?.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Perfil
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </form>
            
            <div className="flex flex-col space-y-2">
              <Link to="/" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Inicio
              </Link>
              <Link to="/feed" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Mundo
              </Link>
              <Link to="/chat" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Chat
              </Link>
              <Link to="/ai" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                <span>ion AI</span>
                <Sparkles className="w-4 h-4 text-accent-500" />
              </Link>
              <Link to="/wallet" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Billetera</span>
              </Link>
              <Link to="/categories" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Categorías
              </Link>
              
              {isAuthenticated && user?.is_admin && (
                <Link to="/admin" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              
              {isAuthenticated && user?.is_admin && (
                <Link to="/admin/config" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Config</span>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to="/affiliate" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Afiliados</span>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to="/disputes" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Disputas</span>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to="/analytics" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <BarChart className="w-4 h-4" />
                  <span>Analíticas</span>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to="/support" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Soporte</span>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to="/bookmarks" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <BookmarkIcon className="w-4 h-4" />
                  <span>Favoritos</span>
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  {isSeller && (
                    <Link to="/seller/dashboard" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Mi Tienda
                    </Link>
                  )}
                  <Link to="/orders" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Mis Pedidos
                  </Link>
                  <Link to="/profile" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Perfil
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="px-4 py-2 btn-primary text-center">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
