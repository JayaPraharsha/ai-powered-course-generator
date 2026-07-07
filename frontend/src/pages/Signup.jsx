import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Sparkles, Star, TrendingUp } from 'lucide-react'
import { useSignUp } from '@clerk/clerk-react'
import AuthLayout from '../components/AuthLayout'
import ErrorMessage from '../components/ErrorMessage'
import GoogleAuthButton from '../components/GoogleAuthButton'

const SIGNUP_FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-powered learning',
    description: 'A crew of AI agents builds and enriches a full course from any topic you type.',
  },
  {
    icon: TrendingUp,
    title: 'Real progress tracking',
    description: 'See lesson and quiz completion across every course, at a glance.',
  },
  {
    icon: Flame,
    title: 'Build a daily streak',
    description: 'Show up each day and watch your learning streak grow.',
  },
  {
    icon: Star,
    title: 'Earn XP and gold',
    description: 'Complete lessons to earn XP and gold, and level up as you go.',
  },
]

function Signup() {
  const { signUp, isLoaded } = useSignUp()
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError] = useState(null)

  async function handleGoogle() {
    if (!isLoaded || status === 'loading') return
    setStatus('loading')
    setError(null)
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      })
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Your generated courses are private to you."
      features={SIGNUP_FEATURES}
    >
      <div className="mt-8 flex flex-col gap-3">
        <GoogleAuthButton onClick={handleGoogle} loading={status === 'loading'} label="Sign up with Google" />
      </div>

      {status === 'error' && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree to sign in securely with Google via Clerk.
      </p>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Signup
