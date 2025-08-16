import { useNavigate } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { ReleaseDetail } from '@/components/ReleaseDetail'
import { useState } from 'react'

export default function ReleaseDetailPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('releases')

  const handleBackToCalendar = () => {
    navigate('/', { state: { activeSection: 'releases' } })
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="ml-64 p-8">
        <ReleaseDetail onBack={handleBackToCalendar} />
      </main>
    </div>
  )
}
