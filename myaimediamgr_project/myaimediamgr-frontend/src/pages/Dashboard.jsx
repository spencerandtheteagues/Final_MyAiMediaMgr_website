import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp,
  Plus,
  Eye,
  Heart,
  MessageSquare,
  Share,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

const metrics = [
  {
    title: 'Total Reach',
    value: '2.4M',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
    color: 'text-green-400'
  },
  {
    title: 'Engagement Rate',
    value: '8.2%',
    change: '+2.1%',
    changeType: 'positive',
    icon: MessageCircle,
    color: 'text-blue-400'
  },
  {
    title: 'Posts Published',
    value: '156',
    change: '+8.3%',
    changeType: 'positive',
    icon: Calendar,
    color: 'text-purple-400'
  },
  {
    title: 'Growth Rate',
    value: '15.3%',
    change: '+4.2%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'text-orange-400'
  }
]

const recentPosts = [
  {
    id: 1,
    platform: 'Twitter',
    status: 'published',
    content: '🚀 Exciting news! Our AI-powered content creation tool just got a major upgrade. Now featuring advanced sentiment analysis and multi-language support.',
    metrics: { views: '12.5K', likes: '342', comments: '89' },
    date: 'Jan 15, 2024',
    avatar: 'T',
    avatarColor: 'bg-blue-500'
  },
  {
    id: 2,
    platform: 'LinkedIn',
    status: 'scheduled',
    content: 'Transform your social media strategy with intelligent automation. See how leading brands are saving 10+ hours per week with our platform.',
    metrics: { views: '8.2K', likes: '156', comments: '34' },
    date: 'Jan 15, 2024',
    avatar: 'L',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 3,
    platform: 'Instagram',
    status: 'pending',
    content: 'Behind the scenes: Creating compelling content with AI assistance. Swipe to see our process ➡️',
    metrics: { views: '15.6K', likes: '892', comments: '167' },
    date: 'Jan 14, 2024',
    avatar: 'I',
    avatarColor: 'bg-pink-500'
  }
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Review Q1 Campaign Content',
    date: 'Jan 16, 2024',
    priority: 'high'
  },
  {
    id: 2,
    title: "Schedule Valentine's Day Posts",
    date: 'Jan 16, 2024',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Analytics Review Meeting',
    date: 'Jan 17, 2024',
    priority: 'low'
  }
]

const quickActions = [
  { name: 'New Post', icon: Plus, color: 'bg-purple-500' },
  { name: 'Schedule', icon: Clock, color: 'bg-blue-500' },
  { name: 'Analytics', icon: BarChart3, color: 'bg-green-500' },
  { name: 'Approve', icon: CheckCircle, color: 'bg-orange-500' }
]

function Dashboard() {
  const [timeRange, setTimeRange] = useState('7')
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false) // Set to false to show prompt

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-500'
      case 'scheduled':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-orange-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, test! 👋</h1>
          <p className="text-slate-400">Here's what's happening with your social media presence today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="dashboard-grid">
        {!hasConnectedAccounts ? (
          <Card className="lg:col-span-4 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                <LinkIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Accounts</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Link your social media profiles to start tracking your performance, view key metrics, and unlock powerful analytics.
              </p>
              <Link to="/platforms">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Accounts
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          metrics.map((metric, index) => (
            <Card key={index} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className={`text-sm ${metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Posts</CardTitle>
              <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center text-white font-semibold`}>
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-slate-400">{post.date}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3 leading-relaxed">{post.content}</p>
                      <div className="flex items-center space-x-6 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.metrics.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.metrics.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post.metrics.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-16 flex-col space-y-2 border-slate-700/50 hover:bg-slate-700/50 text-slate-300"
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs">{action.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/30">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.date}</p>
                  </div>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Credits Usage */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Credits Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Remaining</span>
                <span className="text-lg font-semibold text-white">250 credits</span>
              </div>
              <Progress value={100} className="h-2 bg-slate-700" />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Used: 0</span>
                <span>Total: 250</span>
              </div>
              <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-white">Best Time to Post</p>
                  <p className="text-xs text-slate-400">2-4 PM weekdays</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Top Content Type</p>
                  <p className="text-xs text-slate-400">Educational posts</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Audience Growth</p>
                  <p className="text-xs text-green-400">+15% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard