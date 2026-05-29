import { useState } from 'react'
import { Image, Video, MapPin, Smile, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState([])
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && mediaUrls.length === 0) return

    setLoading(true)

    try {
      const postData = {
        content,
        media_urls: mediaUrls,
        location: location || null,
        post_type: mediaUrls.length > 0 ? 'photo' : 'text'
      }

      await axios.post('/api/posts', postData)
      setContent('')
      setMediaUrls([])
      setLocation('')
      onPostCreated?.()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMediaUrl = () => {
    const url = prompt('Ingresa la URL de la imagen:')
    if (url) {
      setMediaUrls([...mediaUrls, url])
    }
  }

  const removeMediaUrl = (index) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index))
  }

  return (
    <div className="card mb-4">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex-shrink-0"></div>
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué estás pensando, ${user?.username}?`}
              className="w-full resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-500"
              rows={3}
              maxLength={2000}
            />
            
            {/* Media Preview */}
            {mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMediaUrl(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={addMediaUrl}
                  className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Foto</span>
                </button>
                
                <button
                  type="button"
                  className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <Video className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Video</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const loc = prompt('Ubicación:')
                    if (loc) setLocation(loc)
                  }}
                  className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Ubicación</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || (!content.trim() && mediaUrls.length === 0)}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
