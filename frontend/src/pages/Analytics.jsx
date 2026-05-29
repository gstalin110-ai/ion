import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { BarChart, LineChart, TrendingUp, Users, Eye, Heart, MessageSquare } from 'lucide-react'

const Analytics = () => {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)
  const [engagement, setEngagement] = useState(null)
  const [topPosts, setTopPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics()
    }
  }, [isAuthenticated])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [statsRes, engagementRes, postsRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/analytics/engagement'),
        axios.get('/api/analytics/top-posts')
      ])
      setStats(statsRes.data)
      setEngagement(engagementRes.data)
      setTopPosts(postsRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tus analíticas
        </h2>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
        <p className="text-sm text-gray-500">Métricas de tu actividad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={MessageSquare}
          title="Publicaciones"
          value={stats?.posts_count || 0}
          color="blue"
        />
        <StatCard
          icon={Heart}
          title="Likes Recibidos"
          value={stats?.likes_received || 0}
          color="pink"
        />
        <StatCard
          icon={MessageSquare}
          title="Comentarios"
          value={stats?.comments_received || 0}
          color="purple"
        />
        <StatCard
          icon={Eye}
          title="Vistas"
          value={stats?.profile_views || 0}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Tasa de Engagement</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {engagement?.engagement_rate || 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Basado en likes y comentarios
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Alcance Total</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {stats?.posts_viewed || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Publicaciones vistas por otros usuarios
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Publicaciones Más Populares</h3>
        </div>
        
        {topPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay publicaciones aún
          </p>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <div key={post.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 line-clamp-1">
                    {post.content}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views_count}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    pink: 'bg-pink-100 text-pink-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600'
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

export default Analytics
