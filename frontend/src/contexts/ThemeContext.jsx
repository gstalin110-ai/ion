import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const [accentColor, setAccentColor] = useState('indigo')

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    const savedAccent = localStorage.getItem('accentColor')
    
    if (savedTheme) setTheme(savedTheme)
    if (savedAccent) setAccentColor(savedAccent)
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Apply accent color
    localStorage.setItem('accentColor', accentColor)
  }, [accentColor])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setThemeColor = (color) => {
    setAccentColor(color)
  }

  const accentColors = {
    indigo: { primary: '#6366f1', secondary: '#818cf8' },
    purple: { primary: '#8b5cf6', secondary: '#a78bfa' },
    pink: { primary: '#ec4899', secondary: '#f472b6' },
    blue: { primary: '#3b82f6', secondary: '#60a5fa' },
    green: { primary: '#10b981', secondary: '#34d399' },
    orange: { primary: '#f97316', secondary: '#fb923c' },
    red: { primary: '#ef4444', secondary: '#f87171' },
    teal: { primary: '#14b8a6', secondary: '#2dd4bf' }
  }

  const value = {
    theme,
    toggleTheme,
    accentColor,
    setThemeColor,
    accentColors,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
