import { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

const Dropdown = ({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={cn(
          'absolute z-50 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1',
          alignments[align]
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

const DropdownItem = ({ children, onClick, className, danger = false }) => (
  <button
    onClick={() => {
      onClick?.()
    }}
    className={cn(
      'w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
      danger && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
      className
    )}
  >
    {children}
  </button>
)

const DropdownDivider = () => (
  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
)

export { Dropdown, DropdownItem, DropdownDivider }
