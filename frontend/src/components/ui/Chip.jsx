import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const Chip = ({ children, onRemove, variant = 'default', size = 'md', className }) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <div className={cn(
      'inline-flex items-center space-x-2 rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export default Chip
