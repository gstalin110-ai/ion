import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, User } from 'lucide-react'
import StoryViewer from './StoryViewer'
import { useAuth } from '../../contexts/AuthContext'

const StoriesBar = () => {
  const { user, isAuthenticated } = useAuth()
  const [stories, setStories] = useState([])
  const [selectedUserStories, setSelectedUserStories] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/stories/active')
      setStories(response.data)
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (userId) => {
    const userStories = stories.filter(s => s.user_id === userId)
    setSelectedUserStories(userStories)
  }

  const groupStoriesByUser = () => {
    const grouped = {}
    stories.forEach(story => {
      if (!grouped[story.user_id]) {
        grouped[story.user_id] = {
          user_id: story.user_id,
          username: story.username,
          avatar: story.avatar,
          stories: []
        }
      }
      grouped[story.user_id].stories.push(story)
    })
    return Object.values(grouped)
  }

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    )
  }

  const groupedStories = groupStoriesByUser()

  return (
    <>
      <div className="flex space-x-4 p-4 overflow-x-auto bg-white border-b">
        {/* Add Story Button */}
        {isAuthenticated && (
          <button className="flex-shrink-0 flex flex-col items-center space-y-1">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-xs text-gray-600">Tu historia</span>
          </button>
        )}

        {/* User Stories */}
        {groupedStories.map((userGroup) => (
          <button
            key={userGroup.user_id}
            onClick={() => handleUserClick(userGroup.user_id)}
            className="flex-shrink-0 flex flex-col items-center space-y-1"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary-500 to-accent-500">
              <div className="w-full h-full bg-white rounded-full p-0.5">
                {userGroup.avatar ? (
                  <img
                    src={userGroup.avatar}
                    alt={userGroup.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-600 truncate w-16 text-center">
              {userGroup.username}
            </span>
          </button>
        ))}
      </div>

      {selectedUserStories && (
        <StoryViewer
          stories={selectedUserStories}
          onClose={() => setSelectedUserStories(null)}
        />
      )}
    </>
  )
}

export default StoriesBar
