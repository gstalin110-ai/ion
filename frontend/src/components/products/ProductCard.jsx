import { Link } from 'react-router-dom'
import { Star, MapPin, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const ProductCard = ({ product }) => {
  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="card overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-4xl">📦</span>
              </div>
            )}
            
            {/* Favorite Button */}
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>

            {/* Stock Badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-2 left-2 badge bg-orange-500 text-white">
                ¡Últimos {product.stock}!
              </div>
            )}
            
            {product.stock === 0 && (
              <div className="absolute bottom-2 left-2 badge bg-red-500 text-white">
                Agotado
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
              {product.title}
            </h3>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {product.avg_rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">
                {product.review_count || 0} reseñas
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate">{product.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.category_name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard
