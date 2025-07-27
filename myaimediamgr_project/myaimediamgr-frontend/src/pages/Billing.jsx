import { useState } from 'react'
import { CreditCard, Download, Star, Check, Zap, Crown, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses getting started',
    credits: 500,
    features: [
      '500 AI-generated posts per month',
      'Basic analytics',
      '3 social platforms',
      'Email support',
      'Content templates'
    ],
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    current: true
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For growing businesses with advanced needs',
    credits: 1500,
    features: [
      '1,500 AI-generated posts per month',
      'Advanced analytics & insights',
      'Unlimited social platforms',
      'Priority support',
      'Custom templates',
      'Team collaboration',
      'Scheduled posting'
    ],
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For large organizations with custom requirements',
    credits: 5000,
    features: [
      '5,000 AI-generated posts per month',
      'Enterprise analytics',
      'All social platforms',
      'Dedicated account manager',
      'White-label solution',
      'API access',
      'Custom integrations',
      'Advanced security'
    ],
    icon: Rocket,
    color: 'from-orange-500 to-orange-600'
  }
]

const billingHistory = [
  {
    id: 1,
    date: '2024-01-01',
    description: 'Starter Plan - Monthly',
    amount: '$29.00',
    status: 'paid',
    invoice: 'INV-2024-001'
  },
  {
    id: 2,
    date: '2023-12-01',
    description: 'Starter Plan - Monthly',
    amount: '$29.00',
    status: 'paid',
    invoice: 'INV-2023-012'
  },
  {
    id: 3,
    date: '2023-11-01',
    description: 'Starter Plan - Monthly',
    amount: '$29.00',
    status: 'paid',
    invoice: 'INV-2023-011'
  }
]

function Billing() {
  const [currentPlan] = useState('Starter')
  const [creditsUsed] = useState(150)
  const [totalCredits] = useState(500)

  const creditsPercentage = (creditsUsed / totalCredits) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-slate-400">Manage your subscription and billing information</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan & Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{currentPlan} Plan</h3>
                    <p className="text-slate-400">$29/month • Renews on Feb 1, 2024</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Credits Usage</span>
                    <span className="text-white font-semibold">{creditsUsed} / {totalCredits}</span>
                  </div>
                  <Progress value={creditsPercentage} className="h-2 bg-slate-700" />
                  <p className="text-sm text-slate-400">
                    {totalCredits - creditsUsed} credits remaining this month
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    Buy More Credits
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Payment Method */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-slate-400">Expires 12/25</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300">
                    Update Payment Method
                  </Button>
                </CardContent>
              </Card>

              {/* Next Billing */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Next Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date</span>
                      <span className="text-white">Feb 1, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="text-white">$29.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={`bg-slate-800/30 border-slate-700/50 backdrop-blur-sm relative ${plan.popular ? 'ring-2 ring-purple-500/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{plan.credits.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">AI credits per month</div>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.current 
                        ? 'bg-slate-600 text-slate-300 cursor-not-allowed' 
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{bill.description}</p>
                        <p className="text-sm text-slate-400">{new Date(bill.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-white">{bill.amount}</p>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {bill.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Billing

