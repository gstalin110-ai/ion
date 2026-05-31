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
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center">sogyTweb</h1>
      <p className="text-center mt-4">Prueba de carga básica</p>
    </div>
  )
}

export default App
