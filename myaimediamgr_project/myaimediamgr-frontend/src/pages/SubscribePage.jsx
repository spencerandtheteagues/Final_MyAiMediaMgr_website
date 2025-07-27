import { useState, useEffect } from 'react'
import { Check, Crown, Zap, Users, ArrowRight, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

function SubscribePage({ onSubscribe, userInfo }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [trialInfo, setTrialInfo] = useState(null)

  const plans = {
    starter: {
      name: 'Starter',
      icon: Zap,
      price: { monthly: 29, annual: 290 },
      credits: 500,
      features: [
        'Basic AI content generation',
        'Up to 3 platforms',
        'Email support',
        'Basic analytics',
        'Content scheduling'
      ],
      color: 'from-green-500 to-emerald-600',
      popular: false
    },
    pro: {
      name: 'Pro',
      icon: Crown,
      price: { monthly: 79, annual: 790 },
      credits: 2000,
      features: [
        'Advanced AI content generation',
        'Video generation included',
        'Up to 10 platforms',
        'Priority support',
        'Advanced analytics',
        'A/B testing',
        'Team collaboration'
      ],
      color: 'from-purple-500 to-blue-600',
      popular: true
    },
    agency: {
      name: 'Agency',
      icon: Users,
      price: { monthly: 199, annual: 1990 },
      credits: 10000,
      features: [
        'White-label tools',
        'Unlimited platforms',
        'Team access & roles',
        'Custom analytics',
        'Dedicated support',
        'API access',
        'Custom integrations'
      ],
      color: 'from-orange-500 to-red-600',
      popular: false
    }
  }

  useEffect(() => {
    // Fetch trial information
    if (userInfo?.is_trial_active) {
      setTrialInfo({
        daysRemaining: userInfo.trial_days_remaining || 0,
        endDate: userInfo.trial_end_date
      })
    }
  }, [userInfo])

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const subscriptionData = {
        plan: selectedPlan,
        billing_cycle: billingCycle,
        user_id: userInfo?.id || 1
      }
      
      onSubscribe(subscriptionData)
    } catch (error) {
      console.error('Subscription failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDiscountPercentage = () => {
    if (billingCycle === 'annual') {
      return Math.round((1 - (plans[selectedPlan].price.annual / (plans[selectedPlan].price.monthly * 12))) * 100)
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Secure Payment</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start your 14-day free trial. No charges until your trial ends.
          </p>
          
          {trialInfo && trialInfo.daysRemaining > 0 && (
            <div className="mt-6 inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">
                {trialInfo.daysRemaining} days left in your free trial
              </span>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 relative ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.entries(plans).map(([planKey, plan]) => {
            const isSelected = selectedPlan === planKey
            const IconComponent = plan.icon
            
            return (
              <div
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? 'scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className={`h-full bg-slate-800/30 backdrop-blur-sm border-2 rounded-3xl p-8 ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500/5' 
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}>
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-2">
                      ${plan.price[billingCycle]}
                      <span className="text-lg text-slate-400 font-normal">
                        /{billingCycle === 'monthly' ? 'mo' : 'year'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="text-green-400 text-sm font-medium">
                        Save ${(plan.price.monthly * 12) - plan.price.annual} per year
                      </div>
                    )}
                    <div className="text-slate-400 mt-2">
                      {plan.credits.toLocaleString()} credits included
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setSelectedPlan(planKey)}
                    className={`w-full h-12 font-semibold rounded-xl transition-all duration-200 ${
                      isSelected
                        ? `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Payment Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Complete Your Subscription
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                <span className="text-slate-300">Plan</span>
                <span className="text-white font-medium">{plans[selectedPlan].name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                <span className="text-slate-300">Billing</span>
                <span className="text-white font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                <span className="text-slate-300">Credits</span>
                <span className="text-white font-medium">{plans[selectedPlan].credits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-lg font-medium text-white">Total</span>
                <span className="text-2xl font-bold text-white">
                  ${plans[selectedPlan].price[billingCycle]}
                </span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>14-day free trial</strong> - No charges until {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}. 
                  Cancel anytime during your trial.
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Secure payment processing by Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscribePage

