import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Bookmark as BookmarkIcon, Trash2, ShoppingBag, MessageSquare, Video, Image } from 'lucide-react'

const Bookmarks = () => {
  const { user, isAuthenticated } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks()
    }
  }, [isAuthenticated])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/bookmarks')
      setBookmarks(response.data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (itemType, itemId) => {
    try {
      await axios.delete(`/api/bookmarks/${itemType}/${itemId}`)
      fetchBookmarks()
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  const getIcon = (itemType) => {
    switch (itemType) {
      case 'product':
        return <ShoppingBag className="w-5 h-5 text-green-500" />
      case 'post':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'live':
        return <Video className="w-5 h-5 text-red-500" />
      case 'story':
        return <Image className="w-5 h-5 text-purple-500" />
      default:
        return <BookmarkIcon className="w-5 h-5 text-gray-500" />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tus favoritos
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Favoritos</h1>
        <p className="text-sm text-gray-500">Tus productos, posts y contenido guardado</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card p-12 text-center">
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No tienes favoritos aún
          </h3>
          <p className="text-gray-500">
            Guarda productos, posts y contenido para encontrarlos fácilmente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getIcon(bookmark.item_type)}
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {bookmark.item_type}
                  </span>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.item_type, bookmark.item_id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              
              {bookmark.image_url && (
                <img
                  src={bookmark.image_url}
                  alt={bookmark.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {bookmark.title}
              </h3>
              
              <p className="text-xs text-gray-500 mt-2">
                Guardado el {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookmarks
