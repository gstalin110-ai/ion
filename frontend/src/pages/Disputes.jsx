import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { AlertTriangle, MessageSquare, Plus, Send, CheckCircle, XCircle, Clock } from 'lucide-react'

const Disputes = () => {
  const { user, isAuthenticated } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewDispute, setShowNewDispute] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchDisputes()
    }
  }, [isAuthenticated])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/disputes/my')
      setDisputes(response.data)
    } catch (error) {
      console.error('Error fetching disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (disputeId) => {
    try {
      const response = await axios.get(`/api/disputes/${disputeId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleDisputeClick = (dispute) => {
    setSelectedDispute(dispute)
    fetchMessages(dispute.id)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedDispute) return

    try {
      await axios.post(`/api/disputes/${selectedDispute.id}/messages`, {
        message: newMessage
      })
      setNewMessage('')
      fetchMessages(selectedDispute.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'in_review':
        return 'En Revisión'
      case 'resolved':
        return 'Resuelto'
      case 'rejected':
        return 'Rechazado'
      default:
        return status
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tus disputas
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputas y Reembolsos</h1>
          <p className="text-sm text-gray-500">Gestiona tus disputas con vendedores</p>
        </div>
        <button
          onClick={() => setShowNewDispute(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Disputa</span>
        </button>
      </div>

      {showNewDispute && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Crear Nueva Disputa</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Pedido
              </label>
              <input type="text" className="input-field" placeholder="ID del pedido" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Disputa
              </label>
              <select className="input-field">
                <option>Producto no recibido</option>
                <option>Producto no como se describió</option>
                <option>Solicitud de reembolso</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Describe el problema..."
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Enviar Disputa
              </button>
              <button
                type="button"
                onClick={() => setShowNewDispute(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : disputes.length === 0 ? (
            <div className="card p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes disputas</p>
            </div>
          ) : (
            disputes.map((dispute) => (
              <div
                key={dispute.id}
                onClick={() => handleDisputeClick(dispute)}
                className={`card p-4 cursor-pointer transition-colors ${
                  selectedDispute?.id === dispute.id ? 'border-primary-500 border-2' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {dispute.product_title || 'Pedido #' + dispute.order_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dispute.dispute_type}
                    </p>
                  </div>
                  {getStatusIcon(dispute.status)}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {dispute.reason}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {getStatusText(dispute.status)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dispute Details */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedDispute.product_title || 'Pedido #' + selectedDispute.order_id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getStatusText(selectedDispute.status)}
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedDispute.reason}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Mensajes</span>
                </h4>
                
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay mensajes aún
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.user_id === user?.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 input-field"
                  />
                  <button type="submit" className="btn-primary">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Selecciona una disputa
              </h3>
              <p className="text-gray-500">
                Haz clic en una disputa para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Disputes
