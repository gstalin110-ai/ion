import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Award, Trophy, Star, Zap } from 'lucide-react'

const Badges = () => {
  const { user, isAuthenticated } = useAuth()
  const [badges, setBadges] = useState([])
  const [definitions, setDefinitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchBadges()
      fetchDefinitions()
    }
  }, [isAuthenticated])

  const fetchBadges = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/badges')
      setBadges(response.data)
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDefinitions = async () => {
    try {
      const response = await axios.get('/api/badges/definitions')
      setDefinitions(response.data)
    } catch (error) {
      console.error('Error fetching badge definitions:', error)
    }
  }

  const getIcon = (badgeIcon) => {
    const iconMap = {
      '🚀': <Zap className="w-6 h-6 text-orange-500" />,
      '💎': <Trophy className="w-6 h-6 text-blue-500" />,
      '🦋': <Star className="w-6 h-6 text-purple-500" />,
      '🎨': <Award className="w-6 h-6 text-pink-500" />,
      '✓': <Award className="w-6 h-6 text-green-500" />,
      '💰': <Trophy className="w-6 h-6 text-yellow-500" />,
      '📺': <Award className="w-6 h-6 text-red-500" />,
      '📖': <Award className="w-6 h-6 text-indigo-500" />
    }

    return iconMap[badgeIcon] || <Award className="w-6 h-6 text-gray-500" />
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Inicia sesión para ver tus logros</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Award className="w-5 h-5" />
        <span>Logros y Badges</span>
      </h3>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : badges.length === 0 ? (
        <div className="card p-8 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aún no has ganado logros</p>
          <p className="text-sm text-gray-400 mt-2">
            Completa acciones para desbloquear badges
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="card p-4 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-2">
                {badge.badge_icon}
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {badge.badge_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Available Badges */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          Badges Disponibles
        </h4>
        <div className="flex flex-wrap gap-2">
          {definitions.map((def) => {
            const earned = badges.some(b => b.badge_type === def.type)
            return (
              <div
                key={def.type}
                className={`px-3 py-2 rounded-full text-sm ${
                  earned
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
                title={def.description}
              >
                {def.icon} {def.name}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Badges
