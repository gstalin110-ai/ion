import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Users, ShoppingCart, MessageCircle, Wallet, TrendingUp, Settings, Shield, Activity, DollarSign } from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user?.is_admin) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Acceso Denegado
        </h2>
        <p className="text-gray-500">
          No tienes permisos de administrador
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-sm text-gray-500">Control total de la plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={Users}
          title="Usuarios Totales"
          value={stats?.total_users || 0}
          color="blue"
        />
        <StatCard
          icon={ShoppingCart}
          title="Productos"
          value={stats?.total_products || 0}
          color="green"
        />
        <StatCard
          icon={MessageCircle}
          title="Publicaciones"
          value={stats?.total_posts || 0}
          color="pink"
        />
        <StatCard
          icon={Wallet}
          title="Transacciones"
          value={stats?.total_transactions || 0}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={DollarSign}
          title="Total Créditos"
          value={`$${stats?.total_credits || 0}`}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Débitos"
          value={`$${stats?.total_debits || 0}`}
          color="red"
        />
        <StatCard
          icon={Activity}
          title="Conversaciones IA"
          value={stats?.total_ai_conversations || 0}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Retiros Pendientes</h3>
          <p className="text-3xl font-bold text-orange-600">
            {stats?.pending_withdrawals || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Requieren aprobación</p>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Disputas Pendientes</h3>
          <p className="text-3xl font-bold text-red-600">
            {stats?.pending_disputes || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Requieren atención</p>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    pink: 'bg-pink-100 text-pink-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default AdminDashboard
