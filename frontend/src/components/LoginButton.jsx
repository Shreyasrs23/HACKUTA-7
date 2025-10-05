import { useAuth0 } from '@auth0/auth0-react'

function LoginButton() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0()

  if (isAuthenticated) {
    return (
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
      >
        Log Out
      </button>
    )
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="w-full px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      Start Your Application
    </button>
  )
}

export default LoginButton
