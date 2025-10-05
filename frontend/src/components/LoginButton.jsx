import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0()

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="btn-secondary"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="btn-primary"
    >
      Login
    </button>
  )
}

export default LoginButton
