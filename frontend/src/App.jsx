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
                  <Route path="/ai/tools" element={<AITools />} />
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
  )
}

export default App
