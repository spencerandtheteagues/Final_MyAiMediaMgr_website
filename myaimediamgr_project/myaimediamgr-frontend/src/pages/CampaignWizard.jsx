import { useState } from 'react'
import { ChevronRight, ChevronLeft, Calendar, Target, Palette, Sparkles, AlertCircle, Clock, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const steps = [
  { id: 1, name: 'Business Details', icon: Building },
  { id: 2, name: 'Campaign Strategy', icon: Target },
  { id: 3, name: 'Content Planning', icon: Palette },
  { id: 4, name: 'Schedule & Platforms', icon: Calendar },
  { id: 5, name: 'Review & Launch', icon: Sparkles }
]

// Campaign limits
const CAMPAIGN_LIMITS = {
  MAX_DURATION_DAYS: 7,
  MAX_POSTS_PER_DAY: 3,
  MAX_TOTAL_POSTS: 21
}

function CampaignWizard({ user }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [campaignData, setCampaignData] = useState({
    // Business details (required)
    businessName: '',
    productService: '',
    saleStartDate: '',
    saleEndDate: '',
    salePrice: '',
    originalPrice: '',
    hoursOfOperation: '',
    
    // Campaign details
    name: '',
    description: '',
    objective: '',
    targetAudience: '',
    campaignGoal: '',
    
    // Content planning
    contentTypes: [],
    desiredPostTypes: [],
    
    // Schedule and platforms
    platforms: [],
    startDate: '',
    endDate: '',
    postsPerDay: 1,
    totalPosts: 0
  })

  const validateStep = (step) => {
    const newErrors = {}
    
    switch (step) {
      case 1:
        if (!campaignData.businessName.trim()) newErrors.businessName = 'Business name is required'
        if (!campaignData.productService.trim()) newErrors.productService = 'Product/service description is required'
        if (!campaignData.hoursOfOperation.trim()) newErrors.hoursOfOperation = 'Hours of operation are required'
        break
      case 2:
        if (!campaignData.name.trim()) newErrors.name = 'Campaign name is required'
        if (!campaignData.objective) newErrors.objective = 'Campaign objective is required'
        if (!campaignData.targetAudience.trim()) newErrors.targetAudience = 'Target audience is required'
        if (!campaignData.campaignGoal.trim()) newErrors.campaignGoal = 'Campaign goal is required'
        break
      case 3:
        if (campaignData.contentTypes.length === 0) newErrors.contentTypes = 'Select at least one content type'
        if (campaignData.desiredPostTypes.length === 0) newErrors.desiredPostTypes = 'Select at least one post type'
        break
      case 4:
        if (campaignData.platforms.length === 0) newErrors.platforms = 'Select at least one platform'
        if (!campaignData.startDate) newErrors.startDate = 'Start date is required'
        if (!campaignData.endDate) newErrors.endDate = 'End date is required'
        
        // Validate campaign duration
        if (campaignData.startDate && campaignData.endDate) {
          const start = new Date(campaignData.startDate)
          const end = new Date(campaignData.endDate)
          const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
          
          if (diffDays > CAMPAIGN_LIMITS.MAX_DURATION_DAYS) {
            newErrors.endDate = `Campaign duration cannot exceed ${CAMPAIGN_LIMITS.MAX_DURATION_DAYS} days`
          }
          
          if (diffDays < 1) {
            newErrors.endDate = 'End date must be after start date'
          }
        }
        
        // Validate posts per day
        if (campaignData.postsPerDay > CAMPAIGN_LIMITS.MAX_POSTS_PER_DAY) {
          newErrors.postsPerDay = `Maximum ${CAMPAIGN_LIMITS.MAX_POSTS_PER_DAY} posts per day allowed`
        }
        
        // Validate total posts
        if (campaignData.totalPosts > CAMPAIGN_LIMITS.MAX_TOTAL_POSTS) {
          newErrors.totalPosts = `Maximum ${CAMPAIGN_LIMITS.MAX_TOTAL_POSTS} total posts allowed`
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateTotalPosts = () => {
    if (campaignData.startDate && campaignData.endDate) {
      const start = new Date(campaignData.startDate)
      const end = new Date(campaignData.endDate)
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      return Math.min(diffDays * campaignData.postsPerDay, CAMPAIGN_LIMITS.MAX_TOTAL_POSTS)
    }
    return 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field, value) => {
    setCampaignData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-calculate total posts when dates or posts per day change
      if (field === 'startDate' || field === 'endDate' || field === 'postsPerDay') {
        updated.totalPosts = calculateTotalPosts()
      }
      
      return updated
    })
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleArrayChange = (field, value, checked) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>Required Information:</strong> These details help our AI generate accurate, personalized content for your business.
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Business Name *</Label>
              <Input
                placeholder="Enter your business name"
                value={campaignData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.businessName ? 'border-red-500' : ''}`}
              />
              {errors.businessName && <p className="text-red-400 text-sm">{errors.businessName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Product/Service Description *</Label>
              <Textarea
                placeholder="Describe what you're selling or promoting"
                value={campaignData.productService}
                onChange={(e) => handleInputChange('productService', e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-white min-h-24 ${errors.productService ? 'border-red-500' : ''}`}
              />
              {errors.productService && <p className="text-red-400 text-sm">{errors.productService}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Sale Start Date</Label>
                <Input
                  type="date"
                  value={campaignData.saleStartDate}
                  onChange={(e) => handleInputChange('saleStartDate', e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Sale End Date</Label>
                <Input
                  type="date"
                  value={campaignData.saleEndDate}
                  onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Sale Price</Label>
                <Input
                  placeholder="$99"
                  value={campaignData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Original Price</Label>
                <Input
                  placeholder="$149"
                  value={campaignData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Hours of Operation *</Label>
              <Input
                placeholder="Mon-Fri 9AM-6PM, Sat 10AM-4PM"
                value={campaignData.hoursOfOperation}
                onChange={(e) => handleInputChange('hoursOfOperation', e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.hoursOfOperation ? 'border-red-500' : ''}`}
              />
              {errors.hoursOfOperation && <p className="text-red-400 text-sm">{errors.hoursOfOperation}</p>}
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Campaign Name *</Label>
              <Input
                placeholder="Enter campaign name"
                value={campaignData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Campaign Objective *</Label>
              <Select value={campaignData.objective} onValueChange={(value) => handleInputChange('objective', value)}>
                <SelectTrigger className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.objective ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                </SelectContent>
              </Select>
              {errors.objective && <p className="text-red-400 text-sm">{errors.objective}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Target Audience *</Label>
              <Select value={campaignData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                <SelectTrigger className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.targetAudience ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="young-adults">Young Adults (18-25)</SelectItem>
                  <SelectItem value="millennials">Millennials (26-40)</SelectItem>
                  <SelectItem value="gen-x">Gen X (41-55)</SelectItem>
                  <SelectItem value="baby-boomers">Baby Boomers (56+)</SelectItem>
                  <SelectItem value="professionals">Business Professionals</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                </SelectContent>
              </Select>
              {errors.targetAudience && <p className="text-red-400 text-sm">{errors.targetAudience}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Campaign Goal *</Label>
              <Textarea
                placeholder="Describe what you want to achieve with this campaign"
                value={campaignData.campaignGoal}
                onChange={(e) => handleInputChange('campaignGoal', e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-white min-h-24 ${errors.campaignGoal ? 'border-red-500' : ''}`}
              />
              {errors.campaignGoal && <p className="text-red-400 text-sm">{errors.campaignGoal}</p>}
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-white">Content Types *</Label>
              <div className="grid grid-cols-2 gap-4">
                {['Text Posts', 'Images', 'Videos', 'Stories', 'Carousels', 'Polls'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={campaignData.contentTypes.includes(type)}
                      onCheckedChange={(checked) => handleArrayChange('contentTypes', type, checked)}
                    />
                    <Label htmlFor={type} className="text-slate-300">{type}</Label>
                  </div>
                ))}
              </div>
              {errors.contentTypes && <p className="text-red-400 text-sm">{errors.contentTypes}</p>}
            </div>
            
            <div className="space-y-4">
              <Label className="text-white">Desired Post Types *</Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Promotional posts about products/services',
                  'Educational content about industry',
                  'Behind-the-scenes content',
                  'Customer testimonials and reviews',
                  'Tips and how-to guides',
                  'Company news and updates',
                  'User-generated content',
                  'Seasonal/holiday content'
                ].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={campaignData.desiredPostTypes.includes(type)}
                      onCheckedChange={(checked) => handleArrayChange('desiredPostTypes', type, checked)}
                    />
                    <Label htmlFor={type} className="text-slate-300 text-sm">{type}</Label>
                  </div>
                ))}
              </div>
              {errors.desiredPostTypes && <p className="text-red-400 text-sm">{errors.desiredPostTypes}</p>}
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-300">
                  <strong>Campaign Limits:</strong> Maximum 7 days duration, 3 posts per day, 21 total posts per campaign.
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-white">Platforms *</Label>
              <div className="grid grid-cols-2 gap-4">
                {['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={campaignData.platforms.includes(platform)}
                      onCheckedChange={(checked) => handleArrayChange('platforms', platform, checked)}
                    />
                    <Label htmlFor={platform} className="text-slate-300">{platform}</Label>
                  </div>
                ))}
              </div>
              {errors.platforms && <p className="text-red-400 text-sm">{errors.platforms}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Start Date *</Label>
                <Input
                  type="date"
                  value={campaignData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.startDate ? 'border-red-500' : ''}`}
                />
                {errors.startDate && <p className="text-red-400 text-sm">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-white">End Date *</Label>
                <Input
                  type="date"
                  value={campaignData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && <p className="text-red-400 text-sm">{errors.endDate}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Posts Per Day</Label>
              <Select 
                value={campaignData.postsPerDay.toString()} 
                onValueChange={(value) => handleInputChange('postsPerDay', parseInt(value))}
              >
                <SelectTrigger className={`bg-slate-700/50 border-slate-600/50 text-white ${errors.postsPerDay ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select posts per day" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1">1 post per day</SelectItem>
                  <SelectItem value="2">2 posts per day</SelectItem>
                  <SelectItem value="3">3 posts per day (Maximum)</SelectItem>
                </SelectContent>
              </Select>
              {errors.postsPerDay && <p className="text-red-400 text-sm">{errors.postsPerDay}</p>}
            </div>
            
            {campaignData.startDate && campaignData.endDate && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-slate-300">
                  <div className="flex justify-between mb-2">
                    <span>Campaign Duration:</span>
                    <span className="text-white">
                      {Math.ceil((new Date(campaignData.endDate) - new Date(campaignData.startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Posts Per Day:</span>
                    <span className="text-white">{campaignData.postsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Posts:</span>
                    <span className="text-white font-medium">{calculateTotalPosts()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Campaign Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block">Business:</span>
                    <span className="text-white">{campaignData.businessName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Campaign:</span>
                    <span className="text-white">{campaignData.name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block">Objective:</span>
                    <span className="text-white">{campaignData.objective}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Audience:</span>
                    <span className="text-white">{campaignData.targetAudience}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">Platforms:</span>
                  <span className="text-white">{campaignData.platforms.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Content Types:</span>
                  <span className="text-white">{campaignData.contentTypes.join(', ')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block">Duration:</span>
                    <span className="text-white">{campaignData.startDate} to {campaignData.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Posts:</span>
                    <span className="text-white font-medium">{calculateTotalPosts()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                🚀 Your campaign is ready to launch! AI will generate content based on your business details and campaign specifications.
              </p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Campaign Wizard</h1>
        <p className="text-slate-400">Create comprehensive social media campaigns with AI assistance</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id 
                ? 'bg-purple-500 border-purple-500 text-white' 
                : 'border-slate-600 text-slate-400'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-white' : 'text-slate-400'
              }`}>
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-slate-600 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            {(() => {
              const StepIcon = steps[currentStep - 1].icon
              return <StepIcon className="w-5 h-5 mr-2 text-purple-400" />
            })()}
            {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="border-slate-700/50 text-slate-300 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < steps.length ? (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Launch Campaign
          </Button>
        )}
      </div>
    </div>
  )
}

export default CampaignWizard

