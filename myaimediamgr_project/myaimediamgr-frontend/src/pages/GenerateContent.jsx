// Triggering redeployment
import { useState, useCallback } from 'react'
import { Sparkles, Send, Image, Video, Type, Copy, Check, HelpCircle, UploadCloud, FileText, Bot, User } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

function GenerateContent({ user }) {
  const [creationMode, setCreationMode] = useState('ai');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [contentType, setContentType] = useState('text');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedMedia, setGeneratedMedia] = useState(null);
  const [generatedMediaType, setGeneratedMediaType] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [manualText, setManualText] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    disabled: true // Keep manual uploads disabled
  });

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlatforms.length === platforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(platforms.map(p => p.id));
    }
  };

  const handleGenerate = async () => {
    if (!customPrompt.trim() || selectedPlatforms.length === 0) return;

    setLoading(true);
    setGeneratedContent('');
    setGeneratedMedia(null);
    setGeneratedMediaType('');

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
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate content' }));
        throw new Error(errorData.error || 'Server error');
      }

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data.text);
        if (result.data.media_url) {
          setGeneratedMedia(result.data.media_url);
          setGeneratedMediaType(result.data.media_type); // e.g., 'image' or 'video'
        }
      } else {
        throw new Error(result.error || 'Unknown error from API');
      }

    } catch (error) {
      console.error('Content generation failed:', error);
      setGeneratedContent(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    // Manual submission logic remains unchanged and disabled
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
        <p className="text-slate-400">Use AI to generate posts or manually create them for your platforms.</p>
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

        <div className="grid lg:grid-cols-2 gap-8 pt-6 min-h-[70vh]">
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
              {/* Manual creation form remains here, unchanged */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Manual Post Creator
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
                      </div>
                    </div>
                  </div>
                  <Button disabled className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 disabled:opacity-50">
                    <Send className="w-4 h-4 mr-2" /><span>Add to Queue</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* --- PREVIEW COLUMN --- */}
          <div className="flex flex-col space-y-6">
            <TabsContent value="ai" className="m-0 flex-grow flex flex-col space-y-6">
              {/* Generated Text Preview */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex-shrink-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Type className="w-5 h-5 mr-2 text-purple-400" />
                    Generated Text
                  </CardTitle>
                  {generatedContent && !loading && (
                     <Button variant="ghost" size="sm" onClick={handleCopy} className="text-slate-300 hover:text-white">
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-36 overflow-y-auto">
                    {loading && !generatedContent ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedContent || "Generated text will appear here."}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generated Image/Video Preview */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex-grow flex flex-col">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Image className="w-5 h-5 mr-2 text-purple-400" />
                    Generated Image / Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                   {loading && !generatedMedia ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    ) : generatedMedia ? (
                      generatedMediaType === 'image' ? (
                        <img src={generatedMedia} alt="Generated content" className="max-h-full w-auto rounded-lg object-contain" />
                      ) : (
                        <video src={generatedMedia} controls className="max-h-full w-auto rounded-lg" />
                      )
                    ) : (
                      <div className="text-center text-slate-500">
                        <Image className="w-12 h-12 mx-auto mb-4" />
                        <p>Generated visuals will appear here.</p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="m-0 flex-grow">
                {/* Manual Preview Pane */}
                 <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-400" />
                        Manual Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4" />
                            <p>Preview for manual posts will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

export default GenerateContent;