import { useState, useEffect } from 'react';
import { Check, X, Clock, Edit, Calendar, Filter, ImagePlus, Video, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

// Import social media logos
import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import tiktokLogo from '@/assets/social-icons/tiktok-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';

const platformStyles = {
  Twitter: { name: 'X', logo: xLogo, color: 'bg-black' },
  LinkedIn: { name: 'LinkedIn', logo: linkedinLogo, color: 'bg-blue-600' },
  Instagram: { name: 'Instagram', logo: instagramLogo, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  Facebook: { name: 'Facebook', logo: facebookLogo, color: 'bg-blue-500' },
  TikTok: { name: 'TikTok', logo: tiktokLogo, color: 'bg-black' },
};

function ApprovalQueue() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingPosts();
  }, []);

  async function loadPendingPosts() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/content/pending', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch pending posts. Please try again later.');
      }
      const json = await res.json();
      const fetchedPosts = Array.isArray(json.data) ? json.data : [];
      const mapped = fetchedPosts.map(item => ({
        id: item.id,
        platform: item.platform,
        content: item.content,
        scheduledFor: item.scheduledFor || item.scheduled_at || '',
        generatedAt: item.generatedAt || item.created_at || '',
        status: item.status,
        contentType: item.imageUrl ? 'image' : item.videoUrl ? 'video' : 'text',
        imageUrl: item.imageUrl || null,
        videoUrl: item.videoUrl || null,
      }));
      setPosts(mapped);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch pending posts.');
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (postId, action) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/content/${postId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to ${action} post.`);
      }
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      // You might want to show a toast notification here
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };

  const handleSaveEdit = async (postId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/content/${postId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: editedContent }),
      });
      if (!res.ok) {
        throw new Error('Failed to save changes.');
      }
      setPosts(posts.map(p => (p.id === postId ? { ...p, content: editedContent } : p)));
      setEditingPostId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplaceMedia = (postId, mediaType) => {
    navigate(`/generate-content?replacePostId=${postId}&mediaType=${mediaType}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Approval Queue</h1>
          <p className="text-slate-400">Review, edit, and approve AI-generated content before publishing.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="border-slate-700/50 text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {loading && !error && (
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Loading pending posts...</p>
          </CardContent>
        </Card>
      )}

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => {
                  const style = platformStyles[post.platform] || {};
                  const isEditing = editingPostId === post.id;
                  return (
                    <Card key={post.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex flex-col">
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-8 h-8 rounded-full ${style.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                            <img src={style.logo} alt={`${post.platform} logo`} className="w-5 h-5 object-contain" style={{ filter: post.platform === 'Twitter' ? 'invert(1)' : 'none' }} />
                          </div>
                          <h3 className="text-md font-semibold text-white">{style.name}</h3>
                          <Badge className={`${getStatusColor(post.status)} text-white`}>{post.status}</Badge>
                        </div>

                        <div className="flex-grow space-y-3">
                          {isEditing ? (
                            <Textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full bg-slate-700/50 border-slate-600/50 text-white min-h-[120px]"
                            />
                          ) : (
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                          )}

                          {post.imageUrl && <img src={post.imageUrl} alt="Post media" className="rounded-lg w-full" />}
                          {post.videoUrl && <video src={post.videoUrl} controls className="rounded-lg w-full" />}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={() => handleSaveEdit(post.id)} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingPostId(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => handleAction(post.id, 'approve')} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-2" />Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(post.id, 'reject')}><X className="w-4 h-4 mr-2" />Reject</Button>
                              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={() => handleEdit(post)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
                              {(post.contentType === 'image' || post.contentType === 'video') && (
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={() => handleReplaceMedia(post.id, post.contentType)}>
                                  {post.contentType === 'image' ? <ImagePlus className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                                  Replace
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default ApprovalQueue;
