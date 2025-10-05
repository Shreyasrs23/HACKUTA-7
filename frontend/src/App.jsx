import { useAuth0 } from '@auth0/auth0-react'
import LoginButton from './components/LoginButton'
import ChatWindow from './components/ChatWindow'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">CivicScribe</h1>
              <p className="text-xl text-gray-600 mb-4">AI-Powered Form Assistant</p>
              <div className="w-16 h-1 bg-indigo-600 mx-auto mb-6"></div>
              <p className="text-gray-700 leading-relaxed">
                Welcome! Let us help you fill out complex forms through a simple conversation.
                Get started by logging in.
              </p>
            </div>
            <LoginButton />
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Secure authentication powered by Auth0
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CivicScribe</h1>
                  <p className="text-sm text-gray-600">Welcome, {user?.name || 'User'}!</p>
                </div>
                <LoginButton />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ChatWindow />
          </main>
        </div>
      )}
    </div>
  )
}

export default App
