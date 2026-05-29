import { cn } from '../../utils/cn'
import { useState } from 'react'

const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className="tabs">
      {children.map((child, index) => {
        if (child.type === TabList) {
          return <child.type key={index} {...child.props} activeTab={activeTab} setActiveTab={setActiveTab} />
        }
        if (child.type === TabPanel) {
          return <child.type key={index} {...child.props} isActive={child.props.value === activeTab} />
        }
        return child
      })}
    </div>
  )
}

const TabList = ({ children, activeTab, setActiveTab, className }) => (
  <div className={cn('flex space-x-2 border-b border-gray-200 dark:border-gray-700', className)}>
    {children.map((child, index) => (
      <child.type
        key={index}
        {...child.props}
        isActive={child.props.value === activeTab}
        onClick={() => setActiveTab(child.props.value)}
      />
    ))}
  </div>
)

const Tab = ({ children, value, isActive, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 font-medium transition-colors border-b-2',
      isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
      className
    )}
  >
    {children}
  </button>
)

const TabPanel = ({ children, isActive, className }) => (
  <div className={cn('py-4', !isActive && 'hidden', className)}>
    {children}
  </div>
)

export { Tabs, TabList, Tab, TabPanel }
