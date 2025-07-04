import React, { useState, useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })

  const { signIn, signUp, user, loading: authLoading } = useAuth()

  // Check for password reset mode
  useEffect(() => {
    const mode = searchParams.get('mode')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    // If we have reset tokens, redirect to password reset page
    if (mode === 'reset' && accessToken && refreshToken) {
      window.location.href = `/password-reset?access_token=${accessToken}&refresh_token=${refreshToken}`
      return
    }
  }, [searchParams])

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Operation timeout - resetting loading state')
        setLoading(false)
        if (isForgotPassword) {
          setError('Password reset is taking longer than expected. Please try again.')
        } else {
          setError('Login is taking longer than expected. Please try again.')
        }
      }, 15000) // 15 second timeout (increased for password reset emails)

      return () => clearTimeout(timeout)
    }
  }, [loading, isForgotPassword])

  // Reset local loading when auth succeeds
  useEffect(() => {
    if (user && loading) {
      console.log('🎉 User authenticated, clearing loading state')
      setLoading(false)
    }
  }, [user, loading])

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/home" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isForgotPassword) {
      // Validate email before attempting reset
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Handle password reset
      try {
        console.log('🔄 Sending password reset email to:', formData.email)
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: 'https://guardnomad.com/password-reset'
        })
        
        if (error) {
          console.error('Password reset error:', error)
          // Handle specific error cases
          if (error.message.includes('rate limit')) {
            setError('Too many reset attempts. Please wait a few minutes before trying again.')
          } else if (error.message.includes('invalid')) {
            setError('Please enter a valid email address.')
          } else {
            setError(`Password reset failed: ${error.message}`)
          }
        } else {
          console.log('✅ Password reset email sent successfully')
          setSuccess('Password reset email sent! Check your inbox and spam folder for further instructions.')
        }
      } catch (err) {
        console.error('Password reset error:', err)
        setError('Unable to send password reset email. Please check your internet connection and try again.')
      }
      setLoading(false)
      return
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (isSignUp && formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName
        })
        if (error) {
          setError(error.message)
          setLoading(false)
        } else {
          setError('')
          // Don't set loading to false here - let the redirect happen
          // The Navigate component will handle the redirect
        }
      } else {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
          setLoading(false)
        } else {
          // Don't set loading to false here - let the redirect happen
          // The Navigate component will handle the redirect
          console.log('✅ Sign in successful, redirecting...')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' })
    setError('')
    setSuccess('')
  }

  const switchMode = (mode: 'signin' | 'signup' | 'forgot') => {
    resetForm()
    setIsSignUp(mode === 'signup')
    setIsForgotPassword(mode === 'forgot')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Landing */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Auth Card */}
        <div className="glass p-8 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isForgotPassword 
                ? 'Enter your email to receive reset instructions'
                : isSignUp 
                  ? 'Start your safe travel journey today' 
                  : 'Sign in to continue your journey'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors glass"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors glass"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors glass"
                    placeholder="Enter your password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors glass"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isForgotPassword ? 'Send Reset Email' : isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          {!isSignUp && !isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => switchMode('forgot')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <p className="text-gray-600">
                Remember your password?
                <button
                  onClick={() => switchMode('signin')}
                  className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
                  className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}

export default AuthPage