import { useState } from 'react'
import { Sparkles, FileText, Share2, Megaphone, Copy, Check } from 'lucide-react'
import axios from 'axios'

const AITools = () => {
  const [activeTool, setActiveTool] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const tools = [
    {
      id: 'product-description',
      name: 'Generar Descripción',
      description: 'Crea descripciones profesionales para productos',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'social-post',
      name: 'Crear Post Social',
      description: 'Genera contenido viral para redes sociales',
      icon: Share2,
      color: 'pink'
    },
    {
      id: 'marketing-copy',
      name: 'Copy de Marketing',
      description: 'Crea textos persuasivos para ventas',
      icon: Megaphone,
      color: 'green'
    }
  ]

  const handleToolSubmit = async (formData) => {
    setLoading(true)
    setResult('')

    try {
      let endpoint = ''
      let data = {}

      switch (activeTool) {
        case 'product-description':
          endpoint = '/api/ai/tools/product-description'
          data = {
            title: formData.title,
            category: formData.category,
            price: formData.price
          }
          break
        case 'social-post':
          endpoint = '/api/ai/tools/social-post'
          data = {
            content: formData.content,
            platform: formData.platform
          }
          break
        case 'marketing-copy':
          endpoint = '/api/ai/tools/marketing-copy'
          data = {
            title: formData.title,
            description: formData.description,
            price: formData.price,
            goal: formData.goal
          }
          break
      }

      const response = await axios.post(endpoint, data)
      setResult(response.data.description || response.data.post || response.data.copy)
    } catch (error) {
      console.error('Error generating content:', error)
      setResult('Error al generar contenido. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderToolForm = () => {
    switch (activeTool) {
      case 'product-description':
        return (
          <ProductDescriptionForm onSubmit={handleToolSubmit} loading={loading} />
        )
      case 'social-post':
        return (
          <SocialPostForm onSubmit={handleToolSubmit} loading={loading} />
        )
      case 'marketing-copy':
        return (
          <MarketingCopyForm onSubmit={handleToolSubmit} loading={loading} />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Herramientas IA</h1>
          <p className="text-sm text-gray-500">Genera contenido con inteligencia artificial</p>
        </div>
      </div>

      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className="card p-6 text-left hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 bg-${tool.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${tool.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setActiveTool(null)
              setResult('')
            }}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Volver a herramientas
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {tools.find(t => t.id === activeTool)?.name}
              </h3>
              {renderToolForm()}
            </div>

            {result && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Resultado</h3>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">{result}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ProductDescriptionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({ title: '', category: '', price: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título del producto</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
          placeholder="Ej: iPhone 15 Pro Max"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="input-field"
          placeholder="Ej: Electrónica"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="input-field"
          placeholder="999.99"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Generando...' : 'Generar Descripción'}
      </button>
    </form>
  )
}

const SocialPostForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({ content: '', platform: 'instagram' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contenido base</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="input-field"
          rows={4}
          placeholder="Describe qué quieres promocionar..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
        <select
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          className="input-field"
        >
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="twitter">Twitter</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Generando...' : 'Generar Post'}
      </button>
    </form>
  )
}

const MarketingCopyForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({ title: '', description: '', price: '', goal: 'sales' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
          placeholder="Título del producto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Descripción del producto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="input-field"
          placeholder="999.99"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
        <select
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          className="input-field"
        >
          <option value="sales">Ventas</option>
          <option value="awareness">Awareness</option>
          <option value="engagement">Engagement</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Generando...' : 'Generar Copy'}
      </button>
    </form>
  )
}

export default AITools
