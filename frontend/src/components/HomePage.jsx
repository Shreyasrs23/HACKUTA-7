import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { FileText, Play, User, LogOut } from 'lucide-react'

const HomePage = ({ onStartApplication }) => {
  const { user, logout } = useAuth0()

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">CivicScribe</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name || user?.email}!
          </h1>
          <p className="text-xl text-gray-600">
            Choose a form to get started with your application.
          </p>
        </div>

        {/* Available Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SNAP Application */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">Food Assistance (SNAP)</h3>
                <p className="text-sm text-gray-500">Supplemental Nutrition Assistance Program</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Apply for food assistance benefits to help you and your family afford nutritious food.
            </p>
            <button
              onClick={onStartApplication}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Application</span>
            </button>
          </div>

          {/* Coming Soon Forms */}
          <div className="card opacity-60">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-500">Medicaid Application</h3>
                <p className="text-sm text-gray-400">Coming Soon</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Apply for health coverage through Medicaid.
            </p>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="card opacity-60">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-500">Housing Assistance</h3>
                <p className="text-sm text-gray-400">Coming Soon</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Apply for housing assistance programs.
            </p>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose CivicScribe?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
              <p className="text-gray-600">Faster than traditional form filling</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <p className="text-gray-600">Available anytime, anywhere</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <p className="text-gray-600">Secure and private</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
