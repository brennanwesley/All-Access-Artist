import React, { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DEFAULT_SECTION, isDetailPath, normalizeSectionId, pathFromSection, sectionFromPath } from '@/lib/sectionRoutes'

interface NavigationContextType {
  activeSection: string
  setActiveSection: (section: string) => void
  navigateToSection: (section: string) => void
  isOnDetailPage: boolean
  canNavigateDirectly: (section: string) => boolean
}

const NavigationContext = createContext<NavigationContextType | null>(null)

// eslint-disable-next-line react-refresh/only-export-components -- Context modules intentionally export both the provider component and the consumer hook.
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
  const [activeSection, setActiveSection] = useState<string>(() => sectionFromPath(location.pathname))

  // Detect if we're on a detail page (any route with parameters)
  const isOnDetailPage = isDetailPath(location.pathname)

  // Define which sections can be navigated to directly vs require main app
  const canNavigateDirectly = useCallback((_section: string) => {
    // All sections are accessible from main app
    // Detail pages should navigate back to main app for section changes
    return !isOnDetailPage
  }, [isOnDetailPage])

  // Unified navigation handler
  const navigateToSection = useCallback((section: string) => {
    const normalizedSection = normalizeSectionId(section)
    const currentlyOnDetailPage = isDetailPath(location.pathname)
    
    if (currentlyOnDetailPage) {
      // From detail page: navigate to main app with section state
      navigate(pathFromSection(DEFAULT_SECTION), { state: { activeSection: normalizedSection }, replace: true })
    } else {
      // From main app: just change section
      setActiveSection(normalizedSection)
    }
  }, [navigate, location.pathname, setActiveSection])

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
