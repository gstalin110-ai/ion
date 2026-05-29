import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Users, DollarSign, TrendingUp, Link as LinkIcon, Copy, Check } from 'lucide-react'

const AffiliateDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [affiliateData, setAffiliateData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchAffiliateData()
    }
  }, [isAuthenticated])

  const fetchAffiliateData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/affiliate/my')
      setAffiliateData(response.data)
    } catch (error) {
      console.error('Error fetching affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const link = `https://sogytweb.com/ref/${affiliateData?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tu panel de afiliados
        </h2>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programa de Afiliados</h1>
          <p className="text-sm text-gray-500">Gana comisiones por referidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={Users}
          title="Total Referidos"
          value={affiliateData?.total_referrals || 0}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          title="Ganancias Totales"
          value={`$${affiliateData?.total_earnings || 0}`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Tasa de Comisión"
          value={`${affiliateData?.commission_rate || 5}%`}
          color="purple"
        />
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tu Enlace de Referido</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={`https://sogytweb.com/ref/${affiliateData?.referral_code || ''}`}
            className="flex-1 input-field"
          />
          <button
            onClick={copyReferralLink}
            className="btn-primary flex items-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Cómo Funciona</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Comparte tu enlace</p>
              <p className="text-sm text-gray-600">Comparte tu enlace único con amigos y seguidores</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Se registran</p>
              <p className="text-sm text-gray-600">Cuando alguien se registra con tu enlace</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ganas comisiones</p>
              <p className="text-sm text-gray-600">Recibes {affiliateData?.commission_rate || 5}% de sus compras</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
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

export default AffiliateDashboard
