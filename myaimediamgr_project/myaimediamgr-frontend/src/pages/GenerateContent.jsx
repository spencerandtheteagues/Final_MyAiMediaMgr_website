import { useState, useCallback } from 'react'
import { Sparkles, Send, Image, Video, Type, Copy, Check, HelpCircle, UploadCloud, FileText, Bot, User } from 'lucide-react'
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
import { cn } from "@/lib/utils";


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

// New Preview Pane Component
const PreviewPane = ({ textContent, mediaPreview, mediaType, title, icon, loading }) => {
  return (
    <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow grid grid-rows-2 gap-4">
        <div className="row-span-1 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 flex flex-col">
          <Label className="text-slate-400 mb-2 flex items-center"><Type className="w-4 h-4 mr-2" /> Text</Label>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : (
              <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {textContent || "Text preview will appear here..."}
              </pre>
            )}
          </div>
        </div>
        <div className="row-span-1 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 flex flex-col">
          <Label className="text-slate-400 mb-2 flex items-center"><Image className="w-4 h-4 mr-2" /> Media</Label>
          <div className="flex-grow flex items-center justify-center">
            {loading ? (
               <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : mediaPreview ? (
              mediaType?.startsWith('image/') ? (
                <img src={mediaPreview} alt="Preview" className="rounded-lg max-h-full w-auto object-contain" />
              ) : (
                <video src={mediaPreview} controls className="rounded-lg max-h-full w-auto" />
              )
            ) : (
              <div className="text-center text-slate-500">
                <Image className="w-10 h-10 mx-auto mb-2" />
                <p>Media preview will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


function GenerateContent({ user }) {
  const [creationMode, setCreationMode] = useState('ai'); // 'ai' or 'manual'
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [contentType, setContentType] = useState('text')
  const [template, setTemplate] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generatedMedia, setGeneratedMedia] = useState(null) // To hold future generated media URL
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // State for manual creation
  const [manualText, setManualText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    // This functionality is currently disabled as per requirements.
    // When re-enabled, it will set the media file and preview.
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: false,
    disabled: true // Disabling the dropzone
  });

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

  const getSelectedPlatformNames = () => {
    return selectedPlatforms.map(id => 
      platforms.find(p => p.id === id)?.name
    ).join(', ')
  }

  const handleGenerate = async () => {
    if (!customPrompt.trim() || selectedPlatforms.length === 0) {
      return
    }

    setLoading(true)
    setGeneratedContent('')
    setGeneratedMedia(null)
    try {
      // Simulate API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let text = `Here's a generated post about "${customPrompt}" for ${getSelectedPlatformNames()}: #socialmedia #ai #contentcreation`;
      let media = null;

      if (contentType === 'image') {
        text += "\n\nThis post would be accompanied by a stunning AI-generated image.";
        // In a real scenario, you would get a URL from your backend
        media = 'https://images.unsplash.com/photo-1682687220247-9f786e34d472?q=80&w=2071&auto=format&fit=crop';
      } else if (contentType === 'video') {
        text += "\n\nThis post would feature an engaging AI-generated video.";
        // Placeholder for video
        media = 'https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4';
      }
      
      setGeneratedContent(text);
      setGeneratedMedia(media);
      
    } catch (error) {
      console.error('Content generation failed:', error)
      setGeneratedContent(`Error: Could not generate content.`)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualText.trim() || selectedPlatforms.length === 0) {
      alert("Please write some content and select at least one platform.");
      return;
    }
    setLoading(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Submitting:', { manualText, selectedPlatforms });
    alert('Content added to the approval queue!');
    setManualText('');
    setSelectedPlatforms([]);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Content</h1>
        <p className="text-slate-400">A new dual-pane interface for creating and previewing content.</p>
      </div>

      <Tabs value={creationMode} onValueChange={setCreationMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700/50">
          <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" /> AI Generation
          </TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" /> Manual Creation
          </TabsTrigger>
        </TabsList>
        
        <div className="grid lg:grid-cols-2 gap-8 pt-6">
          {/* --- SETTINGS COLUMN --- */}
          <div className="space-y-6">
            <TabsContent value="ai" className="m-0">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                    AI Content Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                      <Label className="text-white">Select Platforms *</Label>
                       <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">
                          {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                        </span>
                        <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-slate-700/50 text-slate-300 hover:text-white">
                          {selectedPlatforms.length === platforms.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {platforms.map((platform) => (
                          <div key={platform.id} onClick={() => handlePlatformToggle(platform.id)}
                            className={cn("cursor-pointer p-3 rounded-lg border-2 flex items-center space-x-2 transition-all",
                              selectedPlatforms.includes(platform.id) ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700/50 hover:border-slate-600/50'
                            )}>
                            <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
                            <span className="text-white text-sm font-medium">{platform.name}</span>
                          </div>
                        ))}
                      </div>
                  </div>

                  {/* Content Type */}
                  <div className="space-y-2">
                    <Label className="text-white">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="text"><div className="flex items-center space-x-2"><Type className="w-4 h-4" /><span>Text Only</span></div></SelectItem>
                        <SelectItem value="image"><div className="flex items-center space-x-2"><Image className="w-4 h-4" /><span>Image + Text</span></div></SelectItem>
                        <SelectItem value="video"><div className="flex items-center space-x-2"><Video className="w-4 h-4" /><span>Video + Text</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Prompt */}
                  <div className="space-y-2">
                    <Label className="text-white">Content Prompt *</Label>
                    <Textarea placeholder="Describe the content you want to generate..." value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="bg-slate-700/50 border-slate-600/50 text-white min-h-32" />
                  </div>

                  {/* Generate Button */}
                  <Button onClick={handleGenerate} disabled={loading || !customPrompt.trim() || selectedPlatforms.length === 0} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50">
                    {loading ? 'Generating...' : <><Sparkles className="w-4 h-4 mr-2" /><span>Generate Content</span></>}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="m-0">
               <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Manual Post Creator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection (reused) */}
                   <div className="space-y-2">
                      <Label className="text-white">Select Platforms *</Label>
                       <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">
                          {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                        </span>
                        <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-slate-700/50 text-slate-300 hover:text-white">
                          {selectedPlatforms.length === platforms.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {platforms.map((platform) => (
                          <div key={platform.id} onClick={() => handlePlatformToggle(platform.id)}
                            className={cn("cursor-pointer p-3 rounded-lg border-2 flex items-center space-x-2 transition-all",
                              selectedPlatforms.includes(platform.id) ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700/50 hover:border-slate-600/50'
                            )}>
                            <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
                            <span className="text-white text-sm font-medium">{platform.name}</span>
                          </div>
                        ))}
                      </div>
                  </div>

                  {/* Manual Text Area */}
                  <div className="space-y-2">
                    <Label className="text-white">Post Content *</Label>
                    <Textarea placeholder="What's on your mind?" value={manualText} onChange={(e) => setManualText(e.target.value)} className="bg-slate-700/50 border-slate-600/50 text-white min-h-48" />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label className="text-white">Upload Media (Coming Soon)</Label>
                    <div {...getRootProps()} className={cn('cursor-not-allowed opacity-50 p-10 rounded-xl border-2 border-dashed border-slate-600/50')}>
                      <input {...getInputProps()} />
                      <div className="text-center">
                        <UploadCloud className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <p className="text-slate-400 font-semibold">Manual uploads are currently disabled</p>
                        <p className="text-xs text-slate-600 mt-1">This feature will be enabled in a future update.</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleManualSubmit} disabled={loading || !manualText.trim() || selectedPlatforms.length === 0} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50">
                    {loading ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /><span>Add to Queue</span></>}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* --- PREVIEW COLUMN --- */}
          <div className="space-y-6">
             <TabsContent value="ai" className="m-0">
                <PreviewPane
                  title="AI Preview"
                  icon={<Bot className="w-5 h-5 mr-2 text-purple-400" />}
                  textContent={generatedContent}
                  mediaPreview={generatedMedia}
                  mediaType={contentType === 'video' ? 'video/mp4' : 'image/jpeg'}
                  loading={loading}
                />
             </TabsContent>
             <TabsContent value="manual" className="m-0">
                <PreviewPane
                  title="Manual Preview"
                  icon={<User className="w-5 h-5 mr-2 text-blue-400" />}
                  textContent={manualText}
                  mediaPreview={mediaPreview}
                  mediaType={mediaFile?.type}
                  loading={loading}
                />
             </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

export default GenerateContent