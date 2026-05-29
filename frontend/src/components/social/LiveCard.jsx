import { Video, Users, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const LiveCard = ({ live }) => {
  return (
    <Link to={`/live/${live.id}`} className="block">
      <div className="card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative">
          {live.thumbnail_url ? (
            <img
              src={live.thumbnail_url}
              alt={live.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Video className="w-16 h-16 text-white" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>EN VIVO</span>
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{live.viewer_count || 0}</span>
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {live.avatar ? (
                <img src={live.avatar} alt={live.username} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{live.username}</p>
              <p className="text-xs text-gray-500">Hace un momento</p>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {live.title}
          </h3>
          
          {live.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {live.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default LiveCard
