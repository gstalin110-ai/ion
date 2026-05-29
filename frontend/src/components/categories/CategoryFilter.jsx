import { useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700">
          {selectedCategory ? selectedCategory.name : 'Todas las categorías'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
          <div className="p-2 max-h-96 overflow-y-auto">
            <button
              onClick={() => {
                onCategoryChange(null)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                !selectedCategory ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange(category)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  selectedCategory?.id === category.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">
                    {category.product_count || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryFilter
