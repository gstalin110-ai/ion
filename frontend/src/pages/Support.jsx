import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { MessageSquare, Plus, Send, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'

const Support = () => {
  const { user, isAuthenticated } = useAuth()
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets()
    }
  }, [isAuthenticated])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/support/my')
      setTickets(response.data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (ticketId) => {
    try {
      const response = await axios.get(`/api/support/${ticketId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket)
    fetchMessages(ticket.id)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTicket) return

    try {
      await axios.post(`/api/support/${selectedTicket.id}/messages`, {
        message: newMessage
      })
      setNewMessage('')
      fetchMessages(selectedTicket.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-orange-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'in_progress':
        return 'En Progreso'
      case 'resolved':
        return 'Resuelto'
      case 'closed':
        return 'Cerrado'
      default:
        return status
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tus tickets de soporte
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
          <p className="text-sm text-gray-500">Gestiona tus tickets de soporte</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Ticket</span>
        </button>
      </div>

      {showNewTicket && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Crear Nuevo Ticket</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <input type="text" className="input-field" placeholder="Breve descripción del problema" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select className="input-field">
                <option>General</option>
                <option>Técnico</option>
                <option>Facturación</option>
                <option>Solicitud de Funcionalidad</option>
                <option>Reporte de Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select className="input-field">
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
                <option>Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Describe en detalle tu problema o solicitud..."
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Enviar Ticket
              </button>
              <button
                type="button"
                onClick={() => setShowNewTicket(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
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
          ) : tickets.length === 0 ? (
            <div className="card p-8 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes tickets de soporte</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleTicketClick(ticket)}
                className={`card p-4 cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id ? 'border-primary-500 border-2' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">{ticket.category}</p>
                  </div>
                  {getStatusIcon(ticket.status)}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {getStatusText(ticket.status)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getStatusText(selectedTicket.status)} • {selectedTicket.category}
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedTicket.description}</p>
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
                              : msg.is_admin
                              ? 'bg-blue-100 text-blue-900'
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
                Selecciona un ticket
              </h3>
              <p className="text-gray-500">
                Haz clic en un ticket para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Support
