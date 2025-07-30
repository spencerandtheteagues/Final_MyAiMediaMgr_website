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
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // State for manual creation
  const [manualText, setManualText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: false
  });

  // ... (handlePlatformToggle, handleSelectAll, handleTemplateSelect remain the same)

  const handleGenerate = async () => {
    // ... (AI generation logic remains the same)
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim() || selectedPlatforms.length === 0) {
      alert("Please write some content and select at least one platform.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('uid', user.id);
    formData.append('text', manualText);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      const response = await fetch('/api/content/create-manual', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to submit manual content');
      }
      const result = await response.json();
      console.log('Manual content submitted:', result);
      // Reset form
      setManualText('');
      setMediaFile(null);
      setMediaPreview(null);
      setSelectedPlatforms([]);
      alert('Content added to the approval queue!');
    } catch (error) {
      console.error('Manual content submission failed:', error);
      alert('There was an error submitting your content.');
    } finally {
      setLoading(false);
    }
  };

  // ... (handleCopy, getSelectedPlatformNames remain the same)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Content</h1>
        <p className="text-slate-400">Generate content with AI or create your own posts manually.</p>
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
        
        <TabsContent value="ai">
          {/* AI Generation UI (existing code) */}
          <div className="grid lg:grid-cols-2 gap-8 pt-6">
            {/* Content Creation Form */}
            <div className="space-y-6">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                {/* ... (rest of the AI form is the same as before) ... */}
              </Card>
            </div>
            {/* Generated Content Preview */}
            <div className="space-y-6">
              {/* ... (rest of the AI preview is the same as before) ... */}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <div className="grid lg:grid-cols-2 gap-8 pt-6">
            <div className="space-y-6">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Create Your Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection (reused) */}
                  <div className="space-y-4">
                    {/* ... (platform selection JSX is the same) ... */}
                  </div>

                  {/* Manual Text Area */}
                  <div className="space-y-2">
                    <Label className="text-white">Post Content *</Label>
                    <Textarea
                      placeholder="What's on your mind?"
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      className="bg-slate-700/50 border-slate-600/50 text-white min-h-48"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label className="text-white">Upload Media (Optional)</Label>
                    <div {...getRootProps()} className={`cursor-pointer p-10 rounded-xl border-2 border-dashed transition-all duration-200 ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600/50 hover:border-slate-500/50'}`}>
                      <input {...getInputProps()} />
                      <div className="text-center">
                        <UploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-white font-semibold">Drag & drop a file here, or click to select</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF, WEBP, MP4, MOV supported</p>
                      </div>
                    </div>
                  </div>

                  {/* Media Preview */}
                  {mediaPreview && (
                    <div>
                      <Label className="text-white">Media Preview</Label>
                      <div className="mt-2 relative">
                        {mediaFile.type.startsWith('image/') ? (
                          <img src={mediaPreview} alt="Preview" className="rounded-lg max-h-64 w-full object-contain" />
                        ) : (
                          <video src={mediaPreview} controls className="rounded-lg max-h-64 w-full" />
                        )}
                        <Button onClick={() => { setMediaFile(null); setMediaPreview(null); }} variant="destructive" size="sm" className="absolute top-2 right-2">Remove</Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleManualSubmit}
                    disabled={loading || !manualText.trim() || selectedPlatforms.length === 0}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Add to Queue ({selectedPlatforms.length} credit{selectedPlatforms.length !== 1 ? 's' : ''})</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {/* You could add a preview for the manual post here if desired */}
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">How it works</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-400 space-y-2 text-sm">
                  <p>1. Select the platforms you want to post to.</p>
                  <p>2. Write your content in the text box.</p>
                  <p>3. Optionally, upload an image or video.</p>
                  <p>4. Click "Add to Queue". Your post will be sent to the Approval Queue for review before publishing.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GenerateContent

