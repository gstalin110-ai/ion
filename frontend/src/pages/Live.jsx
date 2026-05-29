import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Video, Radio, X, Send, Users, Eye } from 'lucide-react'
import { useParams } from 'react-router-dom'

const Live = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [live, setLive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchLive()
  }, [id])

  const fetchLive = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/lives/${id}`)
      setLive(response.data)
    } catch (error) {
      console.error('Error fetching live:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinLive = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para unirte al live')
      return
    }

    try {
      await axios.post(`/api/lives/${id}/join`)
      setJoined(true)
      fetchLive()
    } catch (error) {
      console.error('Error joining live:', error)
    }
  }

  const leaveLive = async () => {
    try {
      await axios.post(`/api/lives/${id}/leave`)
      setJoined(false)
      fetchLive()
    } catch (error) {
      console.error('Error leaving live:', error)
    }
  }

  const endLive = async () => {
    if (!confirm('¿Estás seguro de que quieres terminar el live?')) {
      return
    }

    try {
      await axios.put(`/api/lives/${id}/end`)
      alert('Live terminado')
      fetchLive()
    } catch (error) {
      console.error('Error ending live:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!live) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Live no encontrado</h2>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="relative aspect-video bg-black">
              {live.stream_url ? (
                <video
                  src={live.stream_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-24 h-24 text-gray-600" />
                </div>
              )}
              
              {live.status === 'live' && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                    <span>EN VIVO</span>
                  </span>
                </div>
              )}

              <div className="absolute top-4 right-4">
                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{live.viewer_count || 0}</span>
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {live.avatar ? (
                      <img src={live.avatar} alt={live.username} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{live.username}</p>
                    <p className="text-sm text-gray-500">Hace un momento</p>
                  </div>
                </div>

                {user?.id === live.user_id && live.status === 'live' && (
                  <button
                    onClick={endLive}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Radio className="w-5 h-5" />
                    <span>Terminar Live</span>
                  </button>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{live.title}</h1>
              
              {live.description && (
                <p className="text-gray-600">{live.description}</p>
              )}

              {live.status === 'live' && (
                <div className="mt-6">
                  {!joined ? (
                    <button
                      onClick={joinLive}
                      className="btn-primary w-full"
                    >
                      Unirse al Live
                    </button>
                  ) : (
                    <button
                      onClick={leaveLive}
                      className="btn-secondary w-full"
                    >
                      <X className="w-5 h-5 inline mr-2" />
                      Salir del Live
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Chat del Live</h3>
          
          {joined || live.status === 'ended' ? (
            <>
              <div className="h-96 overflow-y-auto mb-4 space-y-3">
                <div className="text-center text-gray-500 py-8">
                  <p>Chat del live</p>
                </div>
              </div>

              {live.status === 'live' && (
                <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 input-field"
                  />
                  <button className="btn-primary">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Únete al live para ver el chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Live
