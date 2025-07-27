import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Sparkles, 
  LayoutDashboard, 
  PenTool, 
  Wand2, 
  CheckCircle, 
  Share2, 
  CreditCard,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: false },
  { name: 'Generate Content', href: '/generate-content', icon: PenTool, current: false, badge: '2' },
  { name: 'Campaign Wizard', href: '/campaign-wizard', icon: Wand2, current: false },
  { name: 'Approval Queue', href: '/approval-queue', icon: CheckCircle, current: false, badge: '3' },
  { name: 'Platforms', href: '/platforms', icon: Share2, current: false },
  { name: 'Billing', href: '/billing', icon: CreditCard, current: false },
]

function Layout({ children, user, onLogout }) {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trialInfo, setTrialInfo] = useState(null)

  const currentPath = location.pathname

  useEffect(() => {
    // Calculate trial info if user is on trial
    if (user?.is_trial_active && user?.trial_end_date) {
      const endDate = new Date(user.trial_end_date)
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))
      
      setTrialInfo({
        daysRemaining,
        endDate: endDate.toLocaleDateString()
      })
    }
  }, [user])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">MyAiMediaMgr</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Trial Countdown Banner */}
          {trialInfo && trialInfo.daysRemaining > 0 && (
            <div className="mx-4 mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <div className="text-sm">
                  <div className="text-blue-300 font-medium">
                    {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left
                  </div>
                  <div className="text-blue-400 text-xs">
                    Trial ends {trialInfo.endDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-slate-400">{user?.credits_remaining || 250} credits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 lg:mx-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search content, campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Credits Badge - Hidden on mobile */}
              <div className="hidden sm:block px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full">
                <span className="text-sm font-medium text-purple-300">{user?.credits_remaining || 250} credits</span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                    <Link to="/billing" className="flex items-center w-full">
                      Subscription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="text-red-400 hover:bg-slate-700 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Trial warning banner */}
          {trialInfo && trialInfo.daysRemaining <= 3 && trialInfo.daysRemaining > 0 && (
            <div className="px-4 lg:px-8 pb-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-orange-300 font-medium">
                      Your trial expires in {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''}
                    </div>
                    <div className="text-orange-400 text-sm">
                      Upgrade now to continue using all features
                    </div>
                  </div>
                  <Link to="/billing">
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

