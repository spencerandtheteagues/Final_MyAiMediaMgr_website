import { useState, useCallback, useEffect } from 'react';
import { Sparkles, Send, Image, Video, Type, Copy, Check, UploadCloud, FileText, Rocket } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Using Input for single-line fields
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import facebookLogo from '@/assets/social-icons/facebook-logo.svg';
import instagramLogo from '@/assets/social-icons/instagram-logo.svg';
import linkedinLogo from '@/assets/social-icons/linkedin-logo.svg';
import tiktokLogo from '@/assets/social-icons/tiktok-logo.svg';
import xLogo from '@/assets/social-icons/x-logo.svg';
import youtubeLogo from '@/assets/social-icons/youtube-logo.svg';

const platforms = [
  { id: 'twitter', name: 'X', icon: xLogo, color: 'bg-slate-200', charLimit: 280 },
  { id: 'instagram', name: 'Instagram', icon: instagramLogo, color: 'bg-gradient-to-r from-purple-500 to-pink-500', charLimit: 2200 },
  { id: 'linkedin', name: 'LinkedIn', icon: linkedinLogo, color: 'bg-blue-700', charLimit: 3000 },
  { id: 'facebook', name: 'Facebook', icon: facebookLogo, color: 'bg-blue-600', charLimit: 63206 },
  { id: 'tiktok', name: 'TikTok', icon: tiktokLogo, color: 'bg-slate-200', charLimit: 2200 },
  { id: 'youtube', name: 'YouTube', icon: youtubeLogo, color: 'bg-red-600', charLimit: 10000 }
];

function GenerateContent({ user }) {
  const [creationMode, setCreationMode] = useState('ai');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  // AI State - Intelligent Content Brief
  const [contentType, setContentType] = useState('image');
  const [brief, setBrief] = useState({
    mainSubject: '',
    setting: '',
    style: '',
    details: '',
    captionTheme: ''
  });

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
    return () => {
      if (manualFilePreview) URL.revokeObjectURL(manualFilePreview);
    };
  }, [manualFilePreview]);

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  const handleBriefChange = (e) => {
    const { name, value } = e.target;
    setBrief(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!brief.mainSubject.trim() || !brief.captionTheme.trim() || selectedPlatforms.length === 0 || !user?.id) {
      toast.error("Missing Information", {
        description: "Please select platforms and fill out the 'Main Subject' and 'Caption Theme' fields.",
      });
      return;
    }

    setLoading(true);
    setGeneratedContent('');
    setGeneratedMedia(null);
    setGeneratedMediaType('');

    try {
      const payload = {
        brief,
        uid: user.id,
        contentType,
        platforms: selectedPlatforms,
      };

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server returned an invalid, non-JSON response.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
    // This function remains the same
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PreviewBox = () => {
    // This component remains largely the same
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Content</h1>
        <p className="text-slate-400">Use our Intelligent Content Brief to generate posts or manually create them.</p>
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
                <CardHeader><CardTitle className="text-white flex items-center"><Sparkles className="w-5 h-5 mr-2 text-purple-400" />Intelligent Content Brief</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label className="text-white">1. Select Platforms *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((platform) => (
                        <div key={platform.id} onClick={() => handlePlatformToggle(platform.id)}
                          className={cn("cursor-pointer p-3 rounded-lg border-2 flex items-center space-x-2 transition-all",
                            selectedPlatforms.includes(platform.id) ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700/50 hover:border-slate-600/50'
                          )}>
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", platform.color)}>
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
                        <SelectItem value="image"><div className="flex items-center space-x-2"><Image className="w-4 h-4" /><span>Image + Text</span></div></SelectItem>
                        <SelectItem value="video"><div className="flex items-center space-x-2"><Video className="w-4 h-4" /><span>Video + Text</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Intelligent Content Brief Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">3. Describe Your Content</h3>
                    <div>
                      <Label htmlFor="mainSubject" className="text-slate-300">Main Subject *</Label>
                      <Input id="mainSubject" name="mainSubject" value={brief.mainSubject} onChange={handleBriefChange} placeholder="e.g., A robot walking a golden retriever" className="bg-slate-700/50 border-slate-600/50 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="setting" className="text-slate-300">Setting / Background</Label>
                      <Input id="setting" name="setting" value={brief.setting} onChange={handleBriefChange} placeholder="e.g., In a busy park in a futuristic city" className="bg-slate-700/50 border-slate-600/50 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="style" className="text-slate-300">Style & Mood</Label>
                      <Input id="style" name="style" value={brief.style} onChange={handleBriefChange} placeholder="e.g., Photorealistic, cinematic, optimistic" className="bg-slate-700/50 border-slate-600/50 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="details" className="text-slate-300">Additional Details</Label>
                      <Textarea id="details" name="details" value={brief.details} onChange={handleBriefChange} placeholder="e.g., The robot is a sleek, white Tesla Optimus. People in the background are smiling." className="bg-slate-700/50 border-slate-600/50 text-white" />
                    </div>
                     <div>
                      <Label htmlFor="captionTheme" className="text-slate-300">Caption Theme / Message *</Label>
                      <Textarea id="captionTheme" name="captionTheme" value={brief.captionTheme} onChange={handleBriefChange} placeholder="e.g., Excitement about how AI robots will help us in our daily lives." className="bg-slate-700/50 border-slate-600/50 text-white" />
                    </div>
                  </div>

                  <Button onClick={handleGenerate} disabled={loading || !brief.mainSubject.trim() || !brief.captionTheme.trim() || selectedPlatforms.length === 0} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50">
                    {loading ? 'Generating...' : <><Sparkles className="w-4 h-4 mr-2" /><span>Generate Content</span></>}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="m-0">
              {/* Manual creation form remains the same */}
            </TabsContent>
          </div>

          {/* --- PREVIEW COLUMN --- */}
          <div className="flex flex-col space-y-6">
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center"><Type className="w-5 h-5 mr-2 text-purple-400" />Post Text</CardTitle>
                {generatedContent && !loading && (
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedContent)} className="text-slate-300 hover:text-white">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="h-36 overflow-y-auto">
                {loading && !generatedContent ? (
                  <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>
                ) : (
                  <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedContent || "Generated text will appear here."}</pre>
                )}
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm flex-grow flex flex-col min-h-[420px]">
              <CardHeader><CardTitle className="text-white flex items-center"><Image className="w-5 h-5 mr-2 text-purple-400" />Image / Video Preview</CardTitle></CardHeader>
              <CardContent className="flex-grow flex items-center justify-center">
                {loading && !generatedMedia ? (
                  <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>
                ) : generatedMedia ? (
                  generatedMediaType === 'image' ? (
                    <img src={generatedMedia} alt="Content preview" className="max-h-full w-auto rounded-lg object-contain" />
                  ) : (
                    <video src={generatedMedia} controls className="max-h-full w-auto rounded-lg" />
                  )
                ) : (
                  <div className="text-center text-slate-500"><Image className="w-12 h-12 mx-auto mb-4" /><p>Generated visuals will appear here.</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export default GenerateContent;