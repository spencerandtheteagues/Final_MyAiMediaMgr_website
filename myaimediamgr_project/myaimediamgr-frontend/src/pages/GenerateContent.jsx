import { useState, useCallback, useEffect } from 'react';
import { Sparkles, Send, Image, Video, Type, Copy, Check, UploadCloud, FileText, User, Bot, AlertTriangle, Rocket } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import tiktokLogo from '@/assets/social-icons/tiktok-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';
import youtubeLogo from '@/assets/social-icons/youtube-logo.svg';

const platforms = [
  { id: 'twitter', name: 'X', icon: xLogo, color: 'bg-slate-200' },
  { id: 'instagram', name: 'Instagram', icon: instagramLogo, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: linkedinLogo, color: 'bg-blue-700' },
  { id: 'facebook', name: 'Facebook', icon: facebookLogo, color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', icon: tiktokLogo, color: 'bg-slate-200' },
  { id: 'youtube', name: 'YouTube', icon: youtubeLogo, color: 'bg-red-600' }
];

function GenerateContent({ user }) {
  const [creationMode, setCreationMode] = useState('ai');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  // AI State
  const [contentType, setContentType] = useState('text');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generateAiText, setGenerateAiText] = useState(true);
  const [manualTextForAiMedia, setManualTextForAiMedia] = useState('');

  // Manual State
  const [manualText, setManualText] = useState('');
  const [manualFile, setManualFile] = useState(null);
  const [manualFilePreview, setManualFilePreview] = useState(null);

  // Shared State
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedMedia, setGeneratedMedia] = useState(null);
  const [generatedMediaType, setGeneratedMediaType] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setManualFile(file);
      setManualFilePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: false,
    disabled: creationMode !== 'manual'
  });
  
  useEffect(() => {
    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (manualFilePreview) {
        URL.revokeObjectURL(manualFilePreview);
      }
    };
  }, [manualFilePreview]);

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPlatforms(selectedPlatforms.length === platforms.length ? [] : platforms.map(p => p.id));
  };

  const handleGenerate = async () => {
    if (!customPrompt.trim() || selectedPlatforms.length === 0 || !user?.id) {
      toast.error("Missing Information", {
        description: "Please ensure you've selected platforms, entered a prompt, and are logged in.",
      });
      return;
    }

    setLoading(true);
    setGeneratedContent('');
    setGeneratedMedia(null);
    setGeneratedMediaType('');
    setManualTextForAiMedia('');

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: customPrompt,
          uid: user.id,
          contentType: contentType,
          platforms: selectedPlatforms,
          generateText: generateAiText,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server returned an invalid response.' }));
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Content Generated!", { description: "Your AI content has been successfully created." });
        if (result.data.text) setGeneratedContent(result.data.text);
        if (result.data.media_url) {
          setGeneratedMedia(result.data.media_url);
          setGeneratedMediaType(result.data.media_type);
        }
      } else {
        throw new Error(result.error || 'Unknown error from API');
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      setGeneratedContent(`Error: ${error.message}`);
      toast.error("Generation Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (postNow = false) => {
    if (!manualText.trim() || !manualFile || selectedPlatforms.length === 0 || !user?.id) {
       toast.error("Missing Information", {
        description: "Please select platforms, add content, and upload a file.",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('uid', user.id);
    formData.append('text', manualText);
    formData.append('file', manualFile);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('postNow', postNow);

    try {
      const response = await fetch('/api/content/manual_post', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server returned an invalid response.' }));
        throw new Error(errorData.error || 'Failed to submit post');
      }
      
      const result = await response.json();
      if (result.success) {
        toast.success("Success!", { description: `Your post has been ${postNow ? 'published' : 'added to the approval queue'}.` });
        // Reset form
        setManualText('');
        setManualFile(null);
        setManualFilePreview(null);
        setSelectedPlatforms([]);
      } else {
        throw new Error(result.error || 'Unknown error from API');
      }

    } catch (error) {
      console.error('Manual post submission failed:', error);
      toast.error("Submission Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PreviewBox = () => {
    const textToPreview = creationMode === 'ai' ? (generateAiText ? generatedContent : manualTextForAiMedia) : manualText;
    const mediaToPreview = creationMode === 'ai' ? generatedMedia : manualFilePreview;
    const mediaTypeToPreview = creationMode === 'ai' ? generatedMediaType : (manualFile?.type.split('/')[0] || '');

    return (
      <div className="flex flex-col space-y-6">
        {/* Text Preview */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Type className="w-5 h-5 mr-2 text-purple-400" />
              Post Text
            </CardTitle>
            {textToPreview && !loading && (
              <Button variant="ghost" size="sm" onClick={() => handleCopy(textToPreview)} className="text-slate-300 hover:text-white">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {creationMode === 'ai' && !generateAiText && !loading ? (
              <Textarea 
                placeholder="Write your own text to accompany the AI media..." 
                value={manualTextForAiMedia} 
                onChange={(e) => setManualTextForAiMedia(e.target.value)} 
                className="bg-slate-700/50 border-slate-600/50 text-white min-h-36"
              />
            ) : (
              <div className="h-36 overflow-y-auto">
                {loading && !textToPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {textToPreview || (creationMode === 'ai' ? "Generated text will appear here." : "Your post text will appear here.")}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Preview */}
        <Card className={cn(
          "bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex-grow flex flex-col min-h-[420px] pb-6",
          creationMode === 'manual' && "max-h-[300px]"
        )}>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Image className="w-5 h-5 mr-2 text-purple-400" />
              Image / Video Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {loading && !mediaToPreview ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : mediaToPreview ? (
              mediaTypeToPreview === 'image' ? (
                <img src={mediaToPreview} alt="Content preview" className="max-h-full w-auto rounded-lg object-contain" />
              ) : (
                <video src={mediaToPreview} controls className="max-h-full w-auto rounded-lg" />
              )
            ) : (
              <div className="text-center text-slate-500">
                <Image className="w-12 h-12 mx-auto mb-4" />
                <p>{creationMode === 'ai' ? "Generated visuals will appear here." : "Your uploaded media will appear here."}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
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
                <CardHeader><CardTitle className="text-white flex items-center"><Sparkles className="w-5 h-5 mr-2 text-purple-400" />AI Content Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label className="text-white">1. Select Platforms *</Label>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">{selectedPlatforms.length} selected</span>
                      <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-slate-700/50 text-slate-300 hover:text-white">{selectedPlatforms.length === platforms.length ? 'Deselect All' : 'Select All'}</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((platform) => (
                        <div key={platform.id} onClick={() => handlePlatformToggle(platform.id)}
                          className={cn("cursor-pointer p-3 rounded-lg border-2 flex items-center space-x-2 transition-all",
                            selectedPlatforms.includes(platform.id) ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700/50 hover:border-slate-600/50'
                          )}>
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", platform.color, platform.iconColor)}>
                            <img src={platform.icon} alt={platform.name} className="w-3 h-3" />
                          </div>
                          <span className="text-white text-sm font-medium">{platform.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Type */}
                  <div className="space-y-2">
                    <Label className="text-white">2. Choose Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="text"><div className="flex items-center space-x-2"><Type className="w-4 h-4" /><span>Text Only</span></div></SelectItem>
                        <SelectItem value="image"><div className="flex items-center space-x-2"><Image className="w-4 h-4" /><span>Image + Text</span></div></SelectItem>
                        <SelectItem value="video"><div className="flex items-center space-x-2"><Video className="w-4 h-4" /><span>Video + Text</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI Text Generation Checkbox */}
                  {contentType !== 'text' && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox id="ai-text-check" checked={generateAiText} onCheckedChange={setGenerateAiText} className="border-slate-600/50 data-[state=checked]:bg-purple-500" />
                      <Label htmlFor="ai-text-check" className="text-white">Generate post text with AI</Label>
                    </div>
                  )}

                  {/* Custom Prompt */}
                  <div className="space-y-2">
                    <Label className="text-white">3. Write Your Prompt *</Label>
                    <Textarea placeholder="e.g., 'A cinematic 4k video of a futuristic city at night, with a caption about innovation and progress.'" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="bg-slate-700/50 border-slate-600/50 text-white min-h-32" />
                  </div>

                  <Button onClick={handleGenerate} disabled={loading || !customPrompt.trim() || selectedPlatforms.length === 0} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50">
                    {loading ? 'Generating...' : <><Sparkles className="w-4 h-4 mr-2" /><span>Generate Content</span></>}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="m-0">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-400" />Manual Post Creator</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label className="text-white">1. Select Platforms *</Label>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">{selectedPlatforms.length} selected</span>
                        <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-slate-700/50 text-slate-300 hover:text-white">{selectedPlatforms.length === platforms.length ? 'Deselect All' : 'Select All'}</Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {platforms.map((platform) => (
                          <div key={platform.id} onClick={() => handlePlatformToggle(platform.id)}
                            className={cn("cursor-pointer p-3 rounded-lg border-2 flex items-center space-x-2 transition-all",
                              selectedPlatforms.includes(platform.id) ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700/50 hover:border-slate-600/50'
                            )}>
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", platform.color)}>
                              <img src={platform.icon} alt={platform.name} className="w-3 h-3" />
                            </div>
                            <span className="text-white text-sm font-medium">{platform.name}</span>
                          </div>
                        ))}
                      </div>
                  </div>
                  {/* Manual Text Area */}
                  <div className="space-y-2">
                    <Label className="text-white">2. Write Post Content *</Label>
                    <Textarea placeholder="What's on your mind?" value={manualText} onChange={(e) => setManualText(e.target.value)} className="bg-slate-700/50 border-slate-600/50 text-white min-h-32" />
                  </div>
                  {/* File Upload */}
                  <div className="space-y-2 pb-6">
                    <Label className="text-white">3. Upload Media *</Label>
                    <div {...getRootProps()} className={cn('p-10 rounded-xl border-2 border-dashed border-slate-600/50 text-center cursor-pointer hover:border-blue-500 transition-colors', isDragActive && 'border-blue-500 bg-blue-500/10')}>
                      <input {...getInputProps()} />
                      <UploadCloud className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                      {manualFile ? (
                        <p className="text-green-400 font-semibold">{manualFile.name}</p>
                      ) : (
                        <p className="text-slate-400 font-semibold">{isDragActive ? "Drop it like it's hot!" : "Drag & drop, or click to select"}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Button onClick={() => handleManualSubmit(false)} disabled={loading || !manualText.trim() || !manualFile || selectedPlatforms.length === 0} className="w-full md:w-auto h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 disabled:opacity-50">
                      <Send className="w-4 h-4 mr-2" /><span>Add to Queue</span>
                    </Button>
                     <Button onClick={() => handleManualSubmit(true)} disabled={loading || !manualText.trim() || !manualFile || selectedPlatforms.length === 0} className="w-full md:w-auto md:ml-auto h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-50">
                      <Rocket className="w-4 h-4 mr-2" /><span>Post Now</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* --- PREVIEW COLUMN --- */}
          <PreviewBox />
        </div>
      </Tabs>
    </div>
  );
}

export default GenerateContent;
