import React, { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import LoginButton from './components/LoginButton'
import ChatWindow from './components/ChatWindow'
import LandingPage from './components/LandingPage'
import HomePage from './components/HomePage'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0()
  const [currentView, setCurrentView] = useState('landing')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  if (currentView === 'landing') {
    return <HomePage onStartApplication={() => setCurrentView('chat')} />
  }

  return <ChatWindow onBack={() => setCurrentView('landing')} />
}

export default App
