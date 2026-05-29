import { cn } from '../../utils/cn'

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700',
        hover && 'hover:shadow-xl hover:scale-105 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className }) => (
  <div className={cn('p-6 border-b border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
)

const CardBody = ({ children, className }) => (
  <div className={cn('p-6', className)}>
    {children}
  </div>
)

const CardFooter = ({ children, className }) => (
  <div className={cn('p-6 border-t border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
)

export { Card, CardHeader, CardBody, CardFooter }
