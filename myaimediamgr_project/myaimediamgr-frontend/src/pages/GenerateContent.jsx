import { useState, useCallback } from 'react'
import { Sparkles, Send, Image, Video, Type, Copy, Check, HelpCircle, UploadCloud, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import tiktokLogo from '@/assets/social-icons/tiktok-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';
import youtubeLogo from '@/assets/social-icons/youtube-logo.svg';

const platforms = [
  { id: 'twitter', name: 'Twitter', icon: xLogo, color: 'bg-black' },
  { id: 'instagram', name: 'Instagram', icon: instagramLogo, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: linkedinLogo, color: 'bg-blue-600' },
  { id: 'facebook', name: 'Facebook', icon: facebookLogo, color: 'bg-blue-500' },
  { id: 'tiktok', name: 'TikTok', icon: tiktokLogo, color: 'bg-black' },
  { id: 'youtube', name: 'YouTube', icon: youtubeLogo, color: 'bg-red-600' }
];

const contentTemplates = [
    // ... (template data remains the same)
]

function GenerateContent({ user }) {
  const [creationMode, setCreationMode] = useState('ai'); // 'ai' or 'manual'
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [contentType, setContentType] = useState('text')
  const [template, setTemplate] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // ... (rest of the state and functions)

  const handleGenerate = async () => {
    if (!customPrompt.trim() || selectedPlatforms.length === 0) {
      return
    }

    setLoading(true)
    setGeneratedContent('')
    setGeneratedImageUrl('')
    setGeneratedVideoUrl('')
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: customPrompt,
          uid: user.id,
          contentType: contentType,
          platforms: selectedPlatforms
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data.text);
        if (result.data.imageUrl) {
          setGeneratedImageUrl(result.data.imageUrl);
        }
        if (result.data.videoUrl) {
          setGeneratedVideoUrl(result.data.videoUrl);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('Content generation failed:', error)
      setGeneratedContent(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ... (rest of the functions)

  return (
    // ... (rest of the JSX)
        {/* Generated Content Preview */}
        <div className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Type className="w-5 h-5 mr-2 text-green-400" />
                  Generated Text
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

          {/* Generated Image/Video Preview */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex-grow">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Image className="w-5 h-5 mr-2 text-blue-400" />
                Generated Image/Video
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full">
              {generatedImageUrl ? (
                <img src={generatedImageUrl} alt="Generated" className="rounded-lg max-h-full max-w-full object-contain" />
              ) : generatedVideoUrl ? (
                <video src={generatedVideoUrl} controls className="rounded-lg max-h-full max-w-full" />
              ) : (
                <div className="text-center">
                  <Image className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Generated media will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    // ... (rest of the JSX)
  )
}

export default GenerateContent

