import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/social/PostCard'
import FeedTabs from '../components/social/FeedTabs'
import CreatePost from '../components/social/CreatePost'
import LiveCard from '../components/social/LiveCard'
import StoriesBar from '../components/social/StoriesBar'
import { TrendingUp, Home, Compass, User, Video } from 'lucide-react'

const Feed = () => {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState([])
  const [lives, setLives] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('foryou')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = { feed_type: activeTab }
      const [postsRes, livesRes] = await Promise.all([
        axios.get('/api/posts', { params }),
        axios.get('/api/lives/active')
      ])
      setPosts(postsRes.data)
      setLives(livesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    fetchData()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mundo</h1>
        <div className="flex items-center space-x-2">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
          <Link
            to="/feed"
            className="p-2 bg-primary-100 rounded-lg transition-colors"
          >
            <Compass className="w-5 h-5 text-primary-600" />
          </Link>
          <Link
            to="/trending"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </Link>
          <Link
            to="/profile"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Create Post */}
      {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}

      {/* Stories Bar */}
      <StoriesBar />

      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Lives */}
      {lives.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Video className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">Lives Activos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lives.map((live) => (
              <LiveCard key={live.id} live={live} />
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay publicaciones
          </h3>
          <p className="text-gray-500">
            Sé el primero en compartir algo
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Feed
