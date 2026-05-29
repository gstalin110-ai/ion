import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Save, Upload, X, Plus, Minus } from 'lucide-react'

const CreateProduct = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState([''])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category_id: '',
    stock: '',
    location: user?.location || '',
    delivery_type: 'both'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const validUrls = imageUrls.filter(url => url.trim() !== '')

    try {
      await axios.post('/api/products', {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        stock: parseInt(formData.stock),
        images: validUrls
      })
      navigate('/seller/dashboard')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        <p className="text-gray-600 mt-1">Completa la información para publicar tu producto</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del producto
            </label>
            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="input-field pl-10"
                    />
                  </div>
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageUrl}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar otra imagen</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del producto *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={100}
              className="input-field"
              placeholder="Ej: iPhone 15 Pro Max 256GB"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="input-field"
              placeholder="Describe tu producto con detalles..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-field pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="USD">USD - Dólar</option>
                <option value="EC">EC - Dólar Ecuador</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock disponible *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Quito, Ecuador"
            />
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de entrega
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="delivery_type"
                  value="delivery"
                  checked={formData.delivery_type === 'delivery'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Delivery</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="delivery_type"
                  value="pickup"
                  checked={formData.delivery_type === 'pickup'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Recogida</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="delivery_type"
                  value="both"
                  checked={formData.delivery_type === 'both'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Ambos</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/seller/dashboard')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Publicar Producto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProduct
