import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { authApi } from "@/services/apiClient"

const STATIC_OTP = '123456' // Development OTP

export function SignInModal({ isOpen, onClose, onSignIn }) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number')
      return
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await authApi.sendOtp(phoneNumber)

      if (data.success) {
        setStep('otp')
        // Set static OTP for development
        setGeneratedOtp(STATIC_OTP)
        console.log('Development OTP:', STATIC_OTP)
        console.log('Response OTP:', data.otp)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      console.error('Send OTP Error:', err)
      setError('Failed to send OTP. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await authApi.verifyOtp(phoneNumber, otp)

      if (data.success) {
         const userName = data.user.name || `User ${phoneNumber.slice(-4)}`
         
         // Reset form
         resetForm()
         
         // Close modal first
         onClose()
         
         // Then call parent sign in handler
         setTimeout(() => {
           onSignIn({
             token: data.token,
             phone: phoneNumber,
             name: userName,
             id: data.user.id,
           })
         }, 0)
      } else {
        setError(data.error || 'OTP verification failed')
      }
    } catch (err) {
      console.error('Verify OTP Error:', err)
      setError('OTP verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPhoneNumber('')
    setOtp('')
    setStep('phone')
    setError('')
  }

  const closeModal = () => {
    resetForm()
    onClose()
  }

  const handleCloseModal = () => {
    closeModal()
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setOtp('')
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop p-4 sm:p-0">
      <div className="modal-content w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 max-h-screen overflow-y-auto">
        {/* Close Button */}
        <button
            onClick={handleCloseModal}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
          <X className="w-5 sm:w-6 h-5 sm:h-6 text-gray-500" />
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8 pr-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-sm sm:text-base text-gray-600 break-words">
            {step === 'phone' 
              ? 'Enter your phone number to get started'
              : 'Enter the 6-digit OTP sent to your phone'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm break-words">
            {error}
          </div>
        )}

        {/* Phone Number Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-2 sm:px-3 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm sm:text-base">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setError('')
                  }}
                  maxLength="10"
                  className="flex-1 text-sm sm:text-base"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send a 6-digit OTP to verify your number
              </p>
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={isLoading || !phoneNumber}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 h-auto disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                maxLength="6"
                className="text-center text-xl sm:text-2xl tracking-widest font-mono"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Check your SMS inbox for the code
              </p>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || !otp}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 h-auto disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Button
              onClick={handleBackToPhone}
              variant="outline"
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 h-auto text-sm sm:text-base"
              disabled={isLoading}
            >
              Change Phone Number
            </Button>
          </div>
        )}

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center mt-5 sm:mt-6 break-words">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
