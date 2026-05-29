import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react'

const WalletCard = ({ wallet, stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-600" />
          </div>
          <span className="text-sm text-gray-500">Saldo Total</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(wallet?.balance || 0)}
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm text-gray-500">Disponible</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(wallet?.available_balance || 0)}
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-sm text-gray-500">Congelado</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(wallet?.frozen_balance || 0)}
        </p>
      </div>
    </div>
  )
}

export default WalletCard
