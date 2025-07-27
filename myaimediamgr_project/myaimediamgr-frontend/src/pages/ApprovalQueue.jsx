import { useState } from 'react'
import { Check, X, Clock, Eye, Edit, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const pendingPosts = [
  {
    id: 1,
    platform: 'Twitter',
    content: '🚀 Exciting news! Our AI-powered content creation tool just got a major upgrade. Now featuring advanced sentiment analysis and multi-language support. #AI #ContentCreation #Innovation',
    scheduledFor: '2024-01-16 14:30',
    generatedAt: '2024-01-15 10:15',
    status: 'pending',
    contentType: 'text',
    estimatedReach: '12.5K',
    avatar: 'T',
    avatarColor: 'bg-blue-500'
  },
  {
    id: 2,
    platform: 'LinkedIn',
    content: 'Transform your social media strategy with intelligent automation. See how leading brands are saving 10+ hours per week with our platform.',
    scheduledFor: '2024-01-16 09:00',
    generatedAt: '2024-01-15 16:20',
    status: 'pending',
    contentType: 'text',
    estimatedReach: '8.2K',
    avatar: 'L',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 3,
    platform: 'Instagram',
    content: 'Behind the scenes: Creating compelling content with AI assistance. Swipe to see our process ➡️',
    scheduledFor: '2024-01-17 12:00',
    generatedAt: '2024-01-15 14:45',
    status: 'pending',
    contentType: 'image',
    estimatedReach: '15.6K',
    avatar: 'I',
    avatarColor: 'bg-pink-500'
  }
]

function ApprovalQueue() {
  const [posts, setPosts] = useState(pendingPosts)
  const [filter, setFilter] = useState('all')

  const handleApprove = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: 'approved' } : post
    ))
  }

  const handleReject = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: 'rejected' } : post
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500'
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    return post.status === filter
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Approval Queue</h1>
          <p className="text-slate-400">Review and approve AI-generated content before publishing</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="border-slate-700/50 text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <Check className="w-4 h-4 mr-2" />
            Approve All
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({posts.filter(p => p.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({posts.filter(p => p.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({posts.filter(p => p.status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-6 mt-6">
          {filteredPosts.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No posts to review</h3>
                <p className="text-slate-400 text-center">All caught up! New content will appear here for review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full ${post.avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                        {post.avatar}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{post.platform}</h3>
                          <Badge className={`${getStatusColor(post.status)} text-white`}>
                            {post.status}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {post.contentType}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-300 mb-4 leading-relaxed">{post.content}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-slate-400">
                          <div>
                            <span className="font-medium">Scheduled for:</span>
                            <br />
                            {new Date(post.scheduledFor).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Generated:</span>
                            <br />
                            {new Date(post.generatedAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Est. Reach:</span>
                            <br />
                            {post.estimatedReach}
                          </div>
                        </div>
                        
                        {post.status === 'pending' && (
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(post.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(post.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <Calendar className="w-4 h-4 mr-2" />
                              Reschedule
                            </Button>
                          </div>
                        )}
                        
                        {post.status === 'approved' && (
                          <div className="flex items-center space-x-2 text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Approved and scheduled for publishing</span>
                          </div>
                        )}
                        
                        {post.status === 'rejected' && (
                          <div className="flex items-center space-x-2 text-red-400">
                            <X className="w-4 h-4" />
                            <span className="text-sm">Rejected - will not be published</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApprovalQueue

