import { useState, useEffect } from 'react'
import { X, Eye, Send } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const StoryViewer = ({ stories, onClose }) => {
  const { user, isAuthenticated } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [message, setMessage] = useState('')

  const currentStory = stories[currentIndex]

  useEffect(() => {
    if (currentStory && isAuthenticated) {
      markAsViewed(currentStory.id)
    }
  }, [currentIndex, currentStory])

  const markAsViewed = async (storyId) => {
    try {
      await axios.post(`/api/stories/${storyId}/view`)
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-md h-full max-h-screen bg-black">
        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
          {stories.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full ${
                index < currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Story Content */}
        <div className="relative h-full">
          {currentStory.media_type === 'video' ? (
            <video
              src={currentStory.media_url}
              autoPlay
              className="w-full h-full object-contain"
              onClick={handleNext}
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="w-full h-full object-contain"
              onClick={handleNext}
            />
          )}

          {/* User Info */}
          <div className="absolute top-12 left-4 right-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {currentStory.avatar ? (
                <img src={currentStory.avatar} alt={currentStory.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{currentStory.username}</p>
              <p className="text-white/70 text-sm">Hace un momento</p>
            </div>
          </div>

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4">
              <p className="text-white">{currentStory.caption}</p>
            </div>
          )}

          {/* Navigation */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full disabled:opacity-30"
          >
            <div className="w-8 h-8 flex items-center justify-center">←</div>
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === stories.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full disabled:opacity-30"
          >
            <div className="w-8 h-8 flex items-center justify-center">→</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoryViewer
