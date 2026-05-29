import { useState } from 'react'
import { Flame, Users, MapPin } from 'lucide-react'

const FeedTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'foryou', label: 'Para ti', icon: Flame },
    { id: 'friends', label: 'Amigos', icon: Users },
    { id: 'local', label: 'Local', icon: MapPin }
  ]

  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default FeedTabs
