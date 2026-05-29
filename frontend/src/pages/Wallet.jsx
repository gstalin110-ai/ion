import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Plus, Send, Download, History } from 'lucide-react'
import WalletCard from '../components/finance/WalletCard'
import TransactionList from '../components/finance/TransactionList'

const Wallet = () => {
  const { isAuthenticated } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletData()
    }
  }, [isAuthenticated])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [walletRes, statsRes, transactionsRes] = await Promise.all([
        axios.get('/api/wallet'),
        axios.get('/api/wallet/stats'),
        axios.get('/api/wallet/transactions', { params: { limit: 10 } })
      ])
      setWallet(walletRes.data)
      setStats(statsRes.data)
      setTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tu billetera
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
          <h1 className="text-2xl font-bold text-gray-900">Billetera</h1>
          <p className="text-sm text-gray-500">Gestiona tus fondos y transacciones</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Recargar</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Transferir</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Retirar</span>
          </button>
        </div>
      </div>

      <WalletCard wallet={wallet} stats={stats} />

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Resumen</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'transactions' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <History className="w-5 h-5" />
          <span>Historial</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <TransactionList transactions={transactions} />
          
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.total_transactions || 0}</p>
                <p className="text-sm text-gray-500">Transacciones</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${stats?.total_credits || 0}
                </p>
                <p className="text-sm text-gray-500">Total Créditos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  ${stats?.total_debits || 0}
                </p>
                <p className="text-sm text-gray-500">Total Débitos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  ${((stats?.total_credits || 0) - (stats?.total_debits || 0)).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Balance Neto</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <TransactionList transactions={transactions} />
      )}
    </div>
  )
}

export default Wallet
