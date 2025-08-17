import React, { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface NavigationContextType {
  activeSection: string
  setActiveSection: (section: string) => void
  navigateToSection: (section: string) => void
  isOnDetailPage: boolean
  canNavigateDirectly: (section: string) => boolean
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

interface NavigationProviderProps {
  children: React.ReactNode
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState<string>('dashboard')

  // Detect if we're on a detail page (any route with parameters)
  const isOnDetailPage = location.pathname.includes('/releases/')

  // Define which sections can be navigated to directly vs require main app
  const canNavigateDirectly = useCallback((_section: string) => {
    // All sections are accessible from main app
    // Detail pages should navigate back to main app for section changes
    return !isOnDetailPage
  }, [isOnDetailPage])

  // Unified navigation handler
  const navigateToSection = useCallback((section: string) => {
    console.log('NavigationContext: Navigating to section', section, 'from', location.pathname)
    
    if (isOnDetailPage) {
      // From detail page: navigate to main app with section state
      navigate('/', { state: { activeSection: section } })
    } else {
      // From main app: just change section
      setActiveSection(section)
    }
  }, [navigate, location.pathname, isOnDetailPage])

  const contextValue: NavigationContextType = {
    activeSection,
    setActiveSection,
    navigateToSection,
    isOnDetailPage,
    canNavigateDirectly
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}
