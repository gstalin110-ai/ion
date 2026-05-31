import { useState, useEffect } from 'react'
import api from '../api'
import ProductGrid from '../components/products/ProductGrid'
import CategoryFilter from '../components/categories/CategoryFilter'
import { TrendingUp, Sparkles, Zap } from 'lucide-react'

const Home = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory || searchQuery) {
      fetchProducts()
    }
  }, [selectedCategory, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedCategory) params.category_id = selectedCategory.id
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/products', { params })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Bienvenido a sogyTweb
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            El marketplace inteligente del futuro
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="¿Qué estás buscando hoy?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-900 text-lg focus:ring-4 focus:ring-primary-300 outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold mb-2">Tendencias</h3>
            <p className="text-gray-600 text-sm">
              Descubre los productos más populares del momento
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="font-semibold mb-2">IA Inteligente</h3>
            <p className="text-gray-600 text-sm">
              Recomendaciones personalizadas con inteligencia artificial
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Compra Rápida</h3>
            <p className="text-gray-600 text-sm">
              Proceso de compra simple y seguro
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            {selectedCategory ? selectedCategory.name : 'Productos Destacados'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>

        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  )
}

export default Home
