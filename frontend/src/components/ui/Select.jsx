import { cn } from '../../utils/cn'

const Select = ({ children, className, ...props }) => {
  return (
    <select
      className={cn(
        'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
        'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'appearance-none cursor-pointer',
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27currentColor%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E")] bg-no-repeat bg-right',
        'bg-[length:1.5em_1.5em] pr-10',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

const Option = ({ children, ...props }) => (
  <option {...props}>{children}</option>
)

export { Select, Option }
