import { useState } from 'react';
import { Plus, Settings, BarChart3, Users, Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import tiktokLogo from '@/assets/social-icons/tiktok-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';
import youtubeLogo from '@/assets/social-icons/youtube-logo.svg';

const platformLogos = {
  twitter: <img src={xLogo} alt="X Logo" className="w-5 h-5" />,
  instagram: <img src={instagramLogo} alt="Instagram Logo" className="w-5 h-5" />,
  linkedin: <img src={linkedinLogo} alt="LinkedIn Logo" className="w-5 h-5" />,
  facebook: <img src={facebookLogo} alt="Facebook Logo" className="w-5 h-5" />,
  tiktok: <img src={tiktokLogo} alt="TikTok Logo" className="w-5 h-5" />,
  youtube: <img src={youtubeLogo} alt="YouTube Logo" className="w-5 h-5" />,
};


const platforms = [
  {
    id: 'twitter',
    name: 'Twitter',
    connected: true,
    handle: '@myaimediamgr',
    followers: '12.5K',
    engagement: '8.2%',
    postsThisMonth: 24,
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    status: 'active'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    connected: true,
    handle: '@myaimediamgr',
    followers: '8.9K',
    engagement: '12.4%',
    postsThisMonth: 18,
    color: 'bg-pink-500',
    textColor: 'text-pink-400',
    status: 'active'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    connected: true,
    handle: 'MyAiMediaMgr',
    followers: '3.2K',
    engagement: '6.8%',
    postsThisMonth: 12,
    color: 'bg-blue-600',
    textColor: 'text-blue-400',
    status: 'active'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    connected: false,
    handle: '',
    followers: '0',
    engagement: '0%',
    postsThisMonth: 0,
    color: 'bg-blue-700',
    textColor: 'text-blue-400',
    status: 'disconnected'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    connected: false,
    handle: '',
    followers: '0',
    engagement: '0%',
    postsThisMonth: 0,
    color: 'bg-black',
    textColor: 'text-gray-400',
    status: 'disconnected'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    connected: false,
    handle: '',
    followers: '0',
    engagement: '0%',
    postsThisMonth: 0,
    color: 'bg-red-600',
    textColor: 'text-red-400',
    status: 'disconnected'
  }
]

function Platforms() {
  const [platformList, setPlatformList] = useState(platforms)
  const [autoPosting, setAutoPosting] = useState(true)

  const handleConnect = (platformId) => {
    setPlatformList(platformList.map(platform => 
      platform.id === platformId 
        ? { ...platform, connected: true, status: 'active' }
        : platform
    ))
  }

  const handleDisconnect = (platformId) => {
    setPlatformList(platformList.map(platform => 
      platform.id === platformId 
        ? { ...platform, connected: false, status: 'disconnected', handle: '', followers: '0', engagement: '0%', postsThisMonth: 0 }
        : platform
    ))
  }

  const connectedPlatforms = platformList.filter(p => p.connected)
  const disconnectedPlatforms = platformList.filter(p => !p.connected)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platforms</h1>
          <p className="text-slate-400">Connect and manage your social media accounts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-300">Auto-posting</span>
            <Switch checked={autoPosting} onCheckedChange={setAutoPosting} />
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Connected</p>
                <p className="text-2xl font-bold text-white">{connectedPlatforms.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Followers</p>
                <p className="text-2xl font-bold text-white">24.6K</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Posts This Month</p>
                <p className="text-2xl font-bold text-white">54</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Avg. Engagement</p>
                <p className="text-2xl font-bold text-white">9.1%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Connected Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedPlatforms.map((platform) => (
              <Card key={platform.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center`}>
                        {platformLogos[platform.id]}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{platform.name}</CardTitle>
                        <p className="text-sm text-slate-400">{platform.handle}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-white">{platform.followers}</p>
                      <p className="text-xs text-slate-400">Followers</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{platform.engagement}</p>
                      <p className="text-xs text-slate-400">Engagement</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{platform.postsThisMonth}</p>
                      <p className="text-xs text-slate-400">Posts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDisconnect(platform.id)}
                  >
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      {disconnectedPlatforms.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Available Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disconnectedPlatforms.map((platform) => (
              <Card key={platform.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center opacity-50`}>
                        {platformLogos[platform.id]}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{platform.name}</CardTitle>
                        <p className="text-sm text-slate-400">Not connected</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Connect your {platform.name} account to start managing content and analytics.
                  </p>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    onClick={() => handleConnect(platform.id)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect {platform.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Platform Guidelines */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Platform Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Best Practices</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Maintain consistent branding across platforms</li>
                <li>• Optimize content for each platform's audience</li>
                <li>• Use platform-specific hashtags and features</li>
                <li>• Monitor engagement and adjust strategy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Content Limits</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Twitter: 280 characters</li>
                <li>• Instagram: 2,200 characters</li>
                <li>• LinkedIn: 3,000 characters</li>
                <li>• Facebook: 63,206 characters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Platforms