import { useState } from 'react'
import { Eye, EyeOff, Sparkles, Shield, Zap, Globe, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Link } from 'react-router-dom'
import Tour from '@/components/Tour'

function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showTour, setShowTour] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email.split('@')[0],
          email: formData.email,
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userId', data.user.id)
        onLogin(data.user)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tiers = [
    {
      name: 'Starter',
      price: '$29',
      features: [
        '180 Images/month',
        'Unlimited Text Posts',
        'Manual Uploads',
        'Post Scheduler'
      ]
    },
    {
      name: 'Pro',
      price: '$99',
      features: [
        '800 Images/month',
        '2 Premium Videos/month',
        '5 Standard Videos/month',
        'Automated Campaigns'
      ]
    },
    {
      name: 'Business',
      price: '$199',
      features: [
        '1,500 Images/month',
        '8 Premium Videos/month',
        '5 Standard Videos/month',
        'Team Collaboration'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited Images',
        '30 Premium Videos/month',
        'Dedicated Support',
        'API Access'
      ]
    }
  ]

  return (
    <>
      {showTour && <Tour onExit={() => setShowTour(false)} />}
      <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Left side - Tiers */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
          <div className="relative z-10 flex flex-col justify-center text-white w-full">
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">MyAiMediaMgr</h1>
              </div>
              <p className="text-xl text-slate-300 leading-relaxed">
                The all-in-one platform for AI-powered social media management.
              </p>
              <Button onClick={() => setShowTour(true)} variant="outline" className="mt-6 bg-white/10 border-white/20 hover:bg-white/20">
                Take a Tour
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {tiers.map((tier) => (
                <div key={tier.name} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-xl font-semibold mb-4">{tier.name}</h3>
                  <div className="text-3xl font-bold mb-6">{tier.price}<span className="text-base font-normal text-slate-400">/mo</span></div>
                  <ul className="space-y-3 text-slate-300 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-auto">
                    <Button variant="outline" className="w-full bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">MyAiMediaMgr</h1>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400">
                Sign in to continue your AI-powered workflow.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Link to="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Don't have an account? Start your free trial
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage

