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
import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';

const platformLogos = {
  Twitter: xLogo,
  LinkedIn: linkedinLogo,
  Instagram: instagramLogo,
  Facebook: facebookLogo,
};

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
    avatarColor: 'bg-black'
  },
  {
    id: 2,
    platform: 'LinkedIn',
    status: 'scheduled',
    content: 'Transform your social media strategy with intelligent automation. See how leading brands are saving 10+ hours per week with our platform.',
    metrics: { views: '8.2K', likes: '156', comments: '34' },
    date: 'Jan 15, 2024',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 3,
    platform: 'Instagram',
    status: 'pending',
    content: 'Behind the scenes: Creating compelling content with AI assistance. Swipe to see our process ➡️',
    metrics: { views: '15.6K', likes: '892', comments: '167' },
    date: 'Jan 14, 2024',
    avatarColor: 'bg-pink-500'
  }
]

// ... (rest of the component code)

// In the JSX for recentPosts:
<div className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center text-white font-semibold`}>
  <img src={platformLogos[post.platform]} alt={post.platform} className="w-6 h-6" />
</div>