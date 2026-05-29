import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreVertical, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const PostCard = ({ post }) => {
  const { isAuthenticated } = useAuth()
  const [liked, setLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)

  const handleLike = async () => {
    if (!isAuthenticated) return

    try {
      if (liked) {
        await axios.delete(`/api/posts/${post.id}/like`)
        setLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        await axios.post(`/api/posts/${post.id}/like`)
        setLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString('es-ES')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card mb-4"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.user_id}`} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full"></div>
          <div>
            <p className="font-semibold text-gray-900">{post.username}</p>
            <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
          </div>
        </Link>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 whitespace-pre-line">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="relative">
          {post.post_type === 'photo' ? (
            <img
              src={post.media_urls[0]}
              alt="Post media"
              className="w-full max-h-96 object-cover"
            />
          ) : post.post_type === 'video' ? (
            <video
              src={post.media_urls[0]}
              controls
              className="w-full max-h-96"
            />
          ) : null}
        </div>
      )}

      {/* Product Link */}
      {post.product_id && (
        <div className="p-4 bg-gray-50 border-t border-b">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Producto vinculado</p>
              <p className="text-xs text-primary-600">Ver en marketplace</p>
            </div>
          </div>
        </div>
      )}

      {/* Location */}
      {post.location && (
        <div className="px-4 py-2 flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{post.location}</span>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              liked ? 'text-red-500' : 'text-gray-600'
            } hover:text-red-500 transition-colors`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          
          <Link
            to={`/post/${post.id}`}
            className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments_count || 0}</span>
          </Link>
          
          <button className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
            <Share2 className="w-5 h-5" />
            <span>{post.shares_count || 0}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default PostCard
