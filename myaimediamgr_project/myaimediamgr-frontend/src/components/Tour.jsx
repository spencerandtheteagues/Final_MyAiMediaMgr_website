import { useState } from 'react';
import { X, Zap, Image, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Tour = ({ onExit }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to the MyAiMediaMgr Tour!',
      content: 'This quick tour will walk you through the powerful AI-powered features available in our paid plans.',
      icon: Zap,
    },
    {
      title: 'AI-Powered Image Generation',
      content: 'Create stunning, high-quality images for your posts with a simple text prompt. Here is an example of an image generated with Imagen 4.',
      media: <img src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png" alt="AI Generated" className="rounded-lg" />,
      icon: Image,
    },
    {
      title: 'Premium Video Generation',
      content: 'Generate short, engaging videos for your campaigns. This example was created with Veo 3, available on our Enterprise plan.',
      media: <video src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" controls className="rounded-lg w-full" />,
      icon: Video,
    },
    {
      title: 'Ready to Get Started?',
      content: 'Sign up for a 14-day free trial to start scheduling posts with your own content, or choose a plan to unlock our powerful AI features.',
      icon: ArrowRight,
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onExit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md text-white relative">
        <button onClick={onExit} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <currentStep.icon className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold">{currentStep.title}</h2>
          </div>
          <p className="text-slate-300 mb-6">{currentStep.content}</p>
          {currentStep.media && (
            <div className="mb-6">
              {currentStep.media}
            </div>
          )}
          <Button onClick={handleNext} className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
            {step === steps.length - 1 ? 'Finish Tour' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tour;
