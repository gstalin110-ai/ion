import { Star } from 'lucide-react'

const Rating = ({ value, max = 5, readonly = false, onChange }) => {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(max)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => !readonly && onChange(index + 1)}
          disabled={readonly}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`w-5 h-5 ${
              index < value
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default Rating
