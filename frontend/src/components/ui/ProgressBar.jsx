import { cn } from '../../utils/cn'

const ProgressBar = ({ value, max = 100, color = 'primary', size = 'md', className }) => {
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizes[size], className)}>
      <div
        className={cn('h-full transition-all duration-500 ease-out', colors[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar
