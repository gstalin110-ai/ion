import { cn } from '../../utils/cn'

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
      {...props}
    />
  )
}

const SkeletonCard = () => (
  <div className="card p-4 space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
)

const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
)

const SkeletonAvatar = () => (
  <div className="flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
)

const SkeletonButton = () => (
  <Skeleton className="h-10 w-32 rounded-lg" />
)

export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonButton }
