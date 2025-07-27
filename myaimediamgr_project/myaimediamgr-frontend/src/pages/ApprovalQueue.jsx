import { useState, useEffect } from 'react'
import { Check, X, Clock, Eye, Edit, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

// Import social media logos for avatars and previews
import xLogo from '@/assets/social-icons/x-logo.jpg'
import facebookLogo from '@/assets/social-icons/facebook-logo.png'
import instagramLogo from '@/assets/social-icons/instagram-logo.png'
import linkedinLogo from '@/assets/social-icons/linkedin-logo.png'
// Removed YouTube import because manual long‑form video uploads are handled on a separate page.
import tiktokLogo from '@/assets/social-icons/tiktok-logo.png'

// Define styling and assets per platform.  These values are used both for the avatar chips
// on the list view and the preview dialog.  If you add support for additional
// platforms, update this object accordingly.
const platformStyles = {
  Twitter: {
    name: 'X',
    logo: xLogo,
    color: 'bg-black',
    headerBg: 'bg-black',
    headerTextColor: 'text-white',
    bodyBg: 'bg-black',
    textColor: 'text-white',
    border: 'border-blue-600'
  },
  LinkedIn: {
    name: 'LinkedIn',
    logo: linkedinLogo,
    color: 'bg-blue-600',
    headerBg: 'bg-blue-600',
    headerTextColor: 'text-white',
    bodyBg: 'bg-white dark:bg-slate-800',
    textColor: 'text-black dark:text-white',
    border: 'border-blue-600'
  },
  Instagram: {
    name: 'Instagram',
    logo: instagramLogo,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    headerBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    headerTextColor: 'text-white',
    bodyBg: 'bg-white dark:bg-slate-800',
    textColor: 'text-black dark:text-white',
    border: 'border-pink-500'
  },
  Facebook: {
    name: 'Facebook',
    logo: facebookLogo,
    color: 'bg-blue-500',
    headerBg: 'bg-blue-500',
    headerTextColor: 'text-white',
    bodyBg: 'bg-white dark:bg-slate-800',
    textColor: 'text-black dark:text-white',
    border: 'border-blue-500'
  },
  TikTok: {
    name: 'TikTok',
    logo: tiktokLogo,
    color: 'bg-black',
    headerBg: 'bg-black',
    headerTextColor: 'text-white',
    bodyBg: 'bg-black',
    textColor: 'text-white',
    border: 'border-pink-500'
  },
  // YouTube removed: manual long‑form video uploads are handled separately.  See the YouTube page.
}

// NOTE: We previously defined a static `pendingPosts` array for UI
// demonstration purposes.  To make this page production ready, we
// fetch pending posts from the backend when the component mounts (see
// the `useEffect` hook below).  This means there is no longer a
// hard‑coded `pendingPosts` array here.

function ApprovalQueue() {
  // Holds the list of posts awaiting review.  Initially empty and populated
  // by the `useEffect` hook which fetches data from the backend.
  const [posts, setPosts] = useState([])
  // Track whether the fetch is in progress.  Used to show a loading
  // indicator while awaiting the API response.
  const [loading, setLoading] = useState(true)
  // Store any error message encountered during the fetch.  When set, an
  // error alert is displayed to the user.
  const [error, setError] = useState(null)
  // Filter state (all/pending/approved/rejected)
  const [filter, setFilter] = useState('all')
  // Hold the currently selected post for preview.  When non-null, the preview dialog
  // becomes visible.
  const [selectedPost, setSelectedPost] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Fetch pending posts on component mount.  This replaces the previous
  // static data with a call to the backend.  A valid JWT must be stored in
  // localStorage under the key `authToken`.  If the request fails,
  // an error message is stored in state.
  useEffect(() => {
    async function loadPendingPosts() {
      try {
        setLoading(true)
        setError(null)
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        const res = await fetch('/api/content/pending', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        if (!res.ok) {
          throw new Error('Failed to fetch pending posts. Please try again later.')
        }
        const json = await res.json()
        const fetchedPosts = Array.isArray(json.data) ? json.data : []
        const mapped = fetchedPosts.map(item => ({
          id: item.id,
          platform: item.platform,
          content: item.content,
          scheduledFor: item.scheduledFor || item.scheduled_at || item.scheduled_at_time || '',
          generatedAt: item.generatedAt || item.created_at || '',
          status: item.status,
          contentType: item.contentType || 'text',
          estimatedReach: item.estimatedReach || '',
          imageUrl: item.imageUrl || null,
          videoUrl: item.videoUrl || null
        }))
        setPosts(mapped)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to fetch pending posts.')
      } finally {
        setLoading(false)
      }
    }
    loadPendingPosts()
  }, [])

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

  // Render a preview for a single post, approximating the look and feel of
  // each social network.  Different platforms have different header and body
  // backgrounds, border colours and text colours defined in platformStyles.
  const renderPreview = (post) => {
    if (!post) return null
    const style = platformStyles[post.platform] || {}
    return (
      <div className={`rounded-lg overflow-hidden border ${style.border || 'border-slate-600'}`}>        
        {/* Header simulating the platform's native post bar */}
        <div className={`flex items-center space-x-3 p-3 ${style.headerBg || 'bg-slate-700'}`}>
          <div className={`w-8 h-8 rounded-full ${style.color || 'bg-slate-700'} flex items-center justify-center overflow-hidden`}>
            <img
              src={style.logo}
              alt={`${post.platform} logo`}
              className="w-5 h-5 object-contain"
              style={{ filter: post.platform === 'Twitter' ? 'invert(1)' : 'none' }}
            />
          </div>
          <span className={`font-semibold ${style.headerTextColor || 'text-white'}`}>MyAiMediaMgr</span>
        </div>
        {/* Body containing text, image and video preview */}
        <div className={`p-4 space-y-4 ${style.bodyBg || 'bg-slate-800'}`}>
          <p className={`${style.textColor || 'text-white'} text-sm whitespace-pre-line`}>{post.content}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post preview"
              className="w-full rounded-md"
            />
          )}
          {post.videoUrl && (
            <video
              src={post.videoUrl}
              controls
              className="w-full rounded-md"
            />
          )}
        </div>
      </div>
    )
  }

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

      {/* Display an error message if the fetch failed */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-400 font-semibold mb-4">{error}</p>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={async () => {
                setLoading(true)
                setError(null)
                setPosts([])
                try {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
                  const res = await fetch('/api/content/pending', {
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                  })
                  if (!res.ok) throw new Error('Failed to fetch pending posts. Please try again later.')
                  const json = await res.json()
                  const fetched = Array.isArray(json.data) ? json.data : []
                  const mapped = fetched.map(item => ({
                    id: item.id,
                    platform: item.platform,
                    content: item.content,
                    scheduledFor: item.scheduledFor || item.scheduled_at || item.scheduled_at_time || '',
                    generatedAt: item.generatedAt || item.created_at || '',
                    status: item.status,
                    contentType: item.contentType || 'text',
                    estimatedReach: item.estimatedReach || '',
                    imageUrl: item.imageUrl || null,
                    videoUrl: item.videoUrl || null
                  }))
                  setPosts(mapped)
                  setError(null)
                } catch (err) {
                  console.error(err)
                  setError(err.message || 'Failed to fetch pending posts.')
                } finally {
                  setLoading(false)
                }
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state while posts are being fetched */}
      {loading && !error && (
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Loading pending posts...</p>
          </CardContent>
        </Card>
      )}

      {/* Once loading is complete and there's no error, render the tabs */}
      {!loading && !error && (
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
                {filteredPosts.map((post) => {
                  const style = platformStyles[post.platform] || {}
                  return (
                    <Card key={post.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full ${style.color || 'bg-slate-700'} flex items-center justify-center overflow-hidden flex-shrink-0`}
                        >
                          {/* avatar logo */}
                          <img
                            src={style.logo}
                            alt={`${post.platform} logo`}
                            className="w-6 h-6 object-contain"
                            style={{ filter: post.platform === 'Twitter' ? 'invert(1)' : 'none' }}
                          />
                        </div>
                      
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{platformStyles[post.platform]?.name || post.platform}</h3>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                              onClick={() => {
                                setSelectedPost(post)
                                setPreviewOpen(true)
                              }}
                            >
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

      {/* Preview dialog.  When a post is selected for preview, this dialog becomes
          visible and renders the platform-specific preview. */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-slate-800 border-slate-600/50 max-w-2xl">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-lg mb-2">{`Preview on ${platformStyles[selectedPost.platform]?.name || selectedPost.platform}`}</DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mb-4">
                  This preview approximates how your post will look when published on {platformStyles[selectedPost.platform]?.name || selectedPost.platform}.
                </DialogDescription>
              </DialogHeader>
              {renderPreview(selectedPost)}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApprovalQueue