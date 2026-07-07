import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import AuthLayout from '../components/AuthLayout'
import ErrorMessage from '../components/ErrorMessage'
import GoogleAuthButton from '../components/GoogleAuthButton'

function Login() {
  const { signIn, isLoaded } = useSignIn()
  const location = useLocation()
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError] = useState(null)

  async function handleGoogle() {
    if (!isLoaded || status === 'loading') return
    setStatus('loading')
    setError(null)
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: location.state?.from?.pathname || '/',
      })
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <AuthLayout heading="Welcome back" subheading="Log in to see your courses.">
      <div className="mt-8 flex flex-col gap-3">
        <GoogleAuthButton onClick={handleGoogle} loading={status === 'loading'} label="Log in with Google" />
      </div>

      {status === 'error' && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
