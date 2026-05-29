import { ArrowUpRight, ArrowDownLeft, Wallet, Send, Download } from 'lucide-react'

const TransactionList = ({ transactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />
      case 'debit':
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />
      case 'transfer':
        return <Send className="w-5 h-5 text-blue-500" />
      default:
        return <Wallet className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Sin transacciones
        </h3>
        <p className="text-gray-500">
          No tienes transacciones registradas
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Transacciones Recientes</h3>
      </div>
      
      <div className="divide-y">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                {getIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{formatTime(transaction.created_at)}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'credit' || transaction.type === 'deposit' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.type === 'credit' || transaction.type === 'deposit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionList
