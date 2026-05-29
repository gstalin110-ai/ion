import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Settings, DollarSign, Shield, Bell, Palette, Save, AlertTriangle } from 'lucide-react'

const SystemConfig = () => {
  const { user, isAuthenticated } = useAuth()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      fetchConfig()
    }
  }, [isAuthenticated, user])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/config')
      setConfig(response.data)
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await axios.put('/api/admin/config', config)
      setMessage('Configuración guardada exitosamente')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || !user?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Acceso Denegado
        </h2>
        <p className="text-gray-500">
          Solo administradores pueden acceder a esta página
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-sm text-gray-500">Ajustes generales de la plataforma</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Configuración Financiera</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasa de Comisión (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={config?.commission_rate || 5}
                onChange={(e) => setConfig({ ...config, commission_rate: parseFloat(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Porcentaje de comisión para transacciones
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retiro Mínimo ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config?.min_withdrawal || 10}
                onChange={(e) => setConfig({ ...config, min_withdrawal: parseFloat(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Monto mínimo para solicitar retiro
              </p>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Configuración del Sistema</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Modo Mantenimiento</p>
                <p className="text-sm text-gray-500">
                  Desactiva el acceso público a la plataforma
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.maintenance_mode || false}
                  onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {config?.maintenance_mode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje de Mantenimiento
                </label>
                <textarea
                  value={config?.maintenance_message || ''}
                  onChange={(e) => setConfig({ ...config, maintenance_message: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Mensaje que verán los usuarios durante el mantenimiento"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Configuración de Notificaciones</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">
                  Envía notificaciones por email a los usuarios
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.email_notifications || true}
                  onChange={(e) => setConfig({ ...config, email_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-500">
                  Envía notificaciones push en tiempo real
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.push_notifications || true}
                  onChange={(e) => setConfig({ ...config, push_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Warning */}
        {config?.maintenance_mode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Modo Mantenimiento Activo</p>
              <p className="text-sm text-yellow-700">
                La plataforma está en modo mantenimiento. Los usuarios no podrán acceder a la plataforma excepto administradores.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={fetchConfig}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default SystemConfig
