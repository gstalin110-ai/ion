import { cn } from '../../utils/cn'
import { User } from 'lucide-react'

const Avatar = ({ src, alt, size = 'md', className, ...props }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24'
  }

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  )
}

export default Avatar
