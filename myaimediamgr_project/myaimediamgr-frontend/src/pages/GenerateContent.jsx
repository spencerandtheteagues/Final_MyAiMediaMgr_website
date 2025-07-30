import { useState } from 'react'
import { Sparkles, Send, Image, Video, Type, Copy, Check, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import tiktokLogo from '@/assets/social-icons/tiktok-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';
import youtubeLogo from '@/assets/social-icons/youtube-logo.svg';

// ... (rest of the component code)

const platforms = [
  { id: 'twitter', name: 'Twitter', icon: xLogo, color: 'bg-black' },
  { id: 'instagram', name: 'Instagram', icon: instagramLogo, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: linkedinLogo, color: 'bg-blue-600' },
  { id: 'facebook', name: 'Facebook', icon: facebookLogo, color: 'bg-blue-500' },
  { id: 'tiktok', name: 'TikTok', icon: tiktokLogo, color: 'bg-black' },
  { id: 'youtube', name: 'YouTube', icon: youtubeLogo, color: 'bg-red-600' }
];

// ... (in the JSX)
<img src={platform.icon} alt={platform.name} className="w-6 h-6" />


const contentTemplates = [
  {
    id: 'promotional',
    name: 'Promotional Post',
    description: 'Promote products or services',
    prompt: 'Create a promotional post about [product/service] highlighting key benefits and including a call-to-action'
  },
  {
    id: 'educational',
    name: 'Educational Content',
    description: 'Share tips and knowledge',
    prompt: 'Create an educational post sharing valuable tips about [topic] that would help the audience'
  },
  {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    description: 'Show company culture',
    prompt: 'Create a behind-the-scenes post showing [aspect of business] to humanize the brand'
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    description: 'Share customer success',
    prompt: 'Create a post featuring a customer testimonial about [product/service] with social proof'
  },
  {
    id: 'trending',
    name: 'Trending Topic',
    description: 'Join current conversations',
    prompt: 'Create a post about [trending topic] that relates to our business and adds value to the conversation'
  }
]

function GenerateContent({ user }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [contentType, setContentType] = useState('text')
  const [template, setTemplate] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPlatforms.length === platforms.length) {
      setSelectedPlatforms([])
    } else {
      setSelectedPlatforms(platforms.map(p => p.id))
    }
  }

  const handleTemplateSelect = (templateId) => {
    const selectedTemplate = contentTemplates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setTemplate(templateId)
      setCustomPrompt(selectedTemplate.prompt)
    }
  }

  const handleGenerate = async () => {
    if (!customPrompt.trim() || selectedPlatforms.length === 0) {
      return
    }

    setLoading(true)
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const platformNames = selectedPlatforms.map(id => 
        platforms.find(p => p.id === id)?.name
      ).join(', ')
      
      const mockContent = `🚀 Exciting news! We're thrilled to share our latest innovation with you.

✨ Key highlights:
• Revolutionary approach to social media management
• AI-powered content creation
• Multi-platform optimization
• Real-time analytics and insights

Ready to transform your social media strategy? Let's connect and explore the possibilities!

#Innovation #SocialMedia #AI #ContentCreation #DigitalMarketing

---
Generated for: ${platformNames}
Content Type: ${contentType}
${template ? `Template: ${contentTemplates.find(t => t.id === template)?.name}` : ''}`

      setGeneratedContent(mockContent)
      
      // Deduct credits
      if (user?.id) {
        await fetch('/api/subscription/user/credits/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            credits_used: selectedPlatforms.length
          })
        })
      }
    } catch (error) {
      console.error('Content generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getSelectedPlatformNames = () => {
    return selectedPlatforms.map(id => 
      platforms.find(p => p.id === id)?.name
    ).join(', ')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Generate Content</h1>
        <p className="text-slate-400">Create AI-powered content for multiple social media platforms</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Creation Form */}
        <div className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Select Platforms *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose which platforms to generate content for. Each platform costs 1 credit.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400">
                    {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-slate-700/50 text-slate-300 hover:text-white"
                  >
                    {selectedPlatforms.length === platforms.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white text-sm`}>
                          {platform.icon}
                        </div>
                        <div>
                          <div className="text-white font-medium">{platform.name}</div>
                          <div className="text-xs text-slate-400">1 credit</div>
                        </div>
                        <div className="ml-auto">
                          <div className={`w-4 h-4 rounded border-2 ${
                            selectedPlatforms.includes(platform.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-slate-600'
                          }`}>
                            {selectedPlatforms.includes(platform.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <Label className="text-white">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="text">
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Text Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4" />
                        <span>Image + Text</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Video + Text</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label className="text-white">Content Template (Optional)</Label>
                <Select value={template} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                    <SelectValue placeholder="Choose a template or write custom prompt" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {contentTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-slate-400">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Content Prompt *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Describe what content you want to generate. Be specific for better results.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  placeholder="Describe the content you want to generate..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white min-h-32"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !customPrompt.trim() || selectedPlatforms.length === 0}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Content ({selectedPlatforms.length} credit{selectedPlatforms.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </Button>

              {selectedPlatforms.length > 0 && (
                <div className="text-sm text-slate-400 text-center">
                  Will generate content for: {getSelectedPlatformNames()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Content Preview */}
        <div className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Send className="w-5 h-5 mr-2 text-green-400" />
                  Generated Content
                </div>
                {generatedContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-slate-700/50 text-slate-300 hover:text-white"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="text-sm text-slate-400">
                      Ready to post to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700/50 text-slate-300 hover:text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        Post to All
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Generated content will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Info */}
          {user && (
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Credits Remaining</div>
                    <div className="text-sm text-slate-400">
                      {user.subscription_tier || 'trial'} plan
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {user.credits_remaining || 0}
                    </div>
                    <div className="text-sm text-slate-400">
                      of {user.credits_total || 0}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((user.credits_remaining || 0) / (user.credits_total || 1)) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerateContent

