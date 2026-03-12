import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { ChatPage } from "@/pages/chatpage"
import { SignInModal } from "@/components/SignInModal"
import { authApi } from "@/services/apiClient"

function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userId, setUserId] = useState(null)
  const [authToken, setAuthToken] = useState('')
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const phone = localStorage.getItem('userPhone')
    const name = localStorage.getItem('userName')
    const id = localStorage.getItem('userId')

    if (token && phone && name && id) {
      setAuthToken(token)
      setUserPhone(phone)
      setUserName(name)
      setUserId(id)
      setIsLoggedIn(true)
      setIsSignInModalOpen(false)
    } else {
      setIsLoggedIn(false)
      setUserId(null)
      setIsSignInModalOpen(true)
    }

    setIsLoadingAuth(false)
  }, [])

  // Handle sign in
  const handleSignIn = (data) => {
    const { token, phone, name, id } = data

    // Store in localStorage
    localStorage.setItem('authToken', token)
    localStorage.setItem('userPhone', phone)
    localStorage.setItem('userName', name)
    localStorage.setItem('userId', id)

    // Update state
    setAuthToken(token)
    setUserPhone(phone)
    setUserName(name)
    setUserId(id)
    setIsLoggedIn(true)
    setIsSignInModalOpen(false)
  }

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setAuthToken('')
    setUserPhone('')
    setUserName('')
    setUserId(null)
  }

  // Show loading state while restoring auth
  if (isLoadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ChatPage
              isLoggedIn={isLoggedIn}
              userName={userName}
              userPhone={userPhone}
              userId={userId}
              onLogout={handleLogout}
              onLogin={() => setIsSignInModalOpen(true)}
            />
          }
        />
      </Routes>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />
    </>
  )
}

export default App
