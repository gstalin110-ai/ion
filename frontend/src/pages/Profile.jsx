import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { User, MapPin, Calendar, Link as LinkIcon, Twitter, Instagram, Linkedin, Github, Globe, Award, Edit, Camera, ShieldCheck } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { useToast } from '../contexts/ToastContext'
import Badges from '../components/profile/Badges'

const Profile = () => {
  const { user, isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    github: '',
    location: '',
    birth_date: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/users/me')
      setProfile(response.data)
      setEditForm({
        bio: response.data.bio || '',
        website: response.data.website || '',
        twitter: response.data.twitter || '',
        instagram: response.data.instagram || '',
        linkedin: response.data.linkedin || '',
        github: response.data.github || '',
        location: response.data.location || '',
        birth_date: response.data.birth_date || ''
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await axios.put('/api/users/me', editForm)
      await fetchProfile()
      setIsEditing(false)
      success('Perfil actualizado exitosamente')
    } catch (err) {
      error('Error al actualizar perfil')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Inicia sesión para ver tu perfil
        </h2>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-r from-primary-500 to-accent-500"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-2xl border-4 border-white dark:border-gray-800 flex items-center justify-center">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <div className="ml-6 mb-2 flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.username}
                </h1>
                {profile?.is_verified && (
                  <ShieldCheck className="w-5 h-5 text-blue-500" title="Verificado" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {profile?.email}
              </p>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>

          {profile?.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {profile?.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile?.birth_date && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Miembro desde {new Date(profile.birth_date).toLocaleDateString()}</span>
              </div>
            )}
            {profile?.is_seller && (
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Vendedor Verificado</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 mt-4">
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>
            )}
            {profile?.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Twitter className="w-5 h-5 text-blue-400" />
              </a>
            )}
            {profile?.instagram && (
              <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Instagram className="w-5 h-5 text-pink-500" />
              </a>
            )}
            {profile?.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </a>
            )}
            {profile?.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.posts_count || 0}</p>
          <p className="text-gray-600 dark:text-gray-400">Publicaciones</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.followers_count || 0}</p>
          <p className="text-gray-600 dark:text-gray-400">Seguidores</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.following_count || 0}</p>
          <p className="text-gray-600 dark:text-gray-400">Siguiendo</p>
        </div>
      </div>

      {/* Badges */}
      <div className="card p-6">
        <Badges />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar Perfil">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <Textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Cuéntanos sobre ti..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sitio Web
            </label>
            <Input
              type="url"
              value={editForm.website}
              onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              placeholder="https://tusitio.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación
            </label>
            <Input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              placeholder="Ciudad, País"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter
              </label>
              <Input
                type="text"
                value={editForm.twitter}
                onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                placeholder="@usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instagram
              </label>
              <Input
                type="text"
                value={editForm.instagram}
                onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                placeholder="@usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LinkedIn
              </label>
              <Input
                type="url"
                value={editForm.linkedin}
                onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub
              </label>
              <Input
                type="text"
                value={editForm.github}
                onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                placeholder="usuario"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Profile
