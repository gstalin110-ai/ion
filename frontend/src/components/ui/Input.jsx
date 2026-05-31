import { cn } from '../../utils/cn'

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
        'placeholder-gray-400 dark:placeholder-gray-500',
        'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

const Textarea = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
        'placeholder-gray-400 dark:placeholder-gray-500',
        'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-all duration-200 resize-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

export { Input, Textarea }
export default Input
