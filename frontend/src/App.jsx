import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import Navbar from './components/layout/Navbar'
import ToastContainer from './components/ui/ToastContainer'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Chat from './pages/Chat'
import AIChat from './components/ai/AIChat'
import AITools from './components/ai/AITools'
import Wallet from './pages/Wallet'
import AdminDashboard from './pages/AdminDashboard'
import SystemConfig from './pages/SystemConfig'
import Live from './pages/Live'
import AffiliateDashboard from './pages/AffiliateDashboard'
import Disputes from './pages/Disputes'
import Analytics from './pages/Analytics'
import Support from './pages/Support'
import Bookmarks from './pages/Bookmarks'
import Profile from './pages/Profile'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import SellerDashboard from './pages/SellerDashboard'
import CreateProduct from './pages/CreateProduct'

function App() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error en la aplicación</h1>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{error.toString()}</pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary onError={setError}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Navbar />
                <ToastContainer />
                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/ai" element={<AIChat />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/config" element={<SystemConfig />} />
                    <Route path="/live/:id" element={<Live />} />
                    <Route path="/affiliate" element={<AffiliateDashboard />} />
                    <Route path="/disputes" element={<Disputes />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/seller/dashboard" element={<SellerDashboard />} />
                    <Route path="/seller/product/new" element={<CreateProduct />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error en la aplicación</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">{this.state.error.toString()}</pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default App
