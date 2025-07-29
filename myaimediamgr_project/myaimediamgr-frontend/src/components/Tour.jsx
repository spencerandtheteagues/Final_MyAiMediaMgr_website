import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Tour = ({ onExit }) => {
  const [step, setStep] = useState(0);
  const tourSteps = [
    {
      title: 'Welcome to MyAiMediaMgr!',
      content: 'This tour will guide you through the key features of the platform. You are currently in a demo account with pre-populated data.',
      selector: null,
    },
    {
      title: 'The Dashboard',
      content: 'This is your main dashboard, giving you a high-level overview of your social media performance.',
      selector: '[data-testid="dashboard-grid"]',
    },
    {
      title: 'Content Generation',
      content: 'Use our AI-powered tools to generate text, images, and videos for your campaigns.',
      selector: '[data-testid="generate-content-link"]',
    },
    {
      title: 'Approval Queue',
      content: 'Review, edit, and approve all generated content before it gets published. Here you can see examples of image and video posts awaiting approval.',
      selector: '[data-testid="approval-queue-link"]',
    },
    {
      title: 'Platform Management',
      content: 'Connect and manage all of your social media accounts in one place.',
      selector: '[data-testid="platforms-link"]',
    },
    {
      title: 'End of Tour',
      content: 'You will now be logged out of the demo account. Thanks for taking a look!',
      selector: null,
    },
  ];

  useEffect(() => {
    if (step === tourSteps.length - 1) {
      setTimeout(() => {
        onExit();
      }, 3000);
    }
  }, [step, onExit, tourSteps.length]);

  const currentStep = tourSteps[step];
  const highlightElement = currentStep.selector ? document.querySelector(currentStep.selector) : null;
  const elementRect = highlightElement ? highlightElement.getBoundingClientRect() : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div
        className="absolute bg-white rounded-lg shadow-xl p-6 w-96 transition-all duration-300"
        style={
          elementRect
            ? {
                top: `${elementRect.bottom + 10}px`,
                left: `${elementRect.left}px`,
              }
            : {}
        }
      >
        <h3 className="text-lg font-bold mb-2">{currentStep.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {step + 1} / {tourSteps.length}
          </span>
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm px-4 py-2 rounded-md mr-2"
              >
                Back
              </button>
            )}
            {step < tourSteps.length - 1 && (
              <button
                onClick={() => setStep(step + 1)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Next
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onExit}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {elementRect && (
        <div
          className="absolute border-4 border-blue-500 border-dashed rounded-lg transition-all duration-300"
          style={{
            top: `${elementRect.top - 4}px`,
            left: `${elementRect.left - 4}px`,
            width: `${elementRect.width + 8}px`,
            height: `${elementRect.height + 8}px`,
          }}
        />
      )}
    </div>
  );
};

export default Tour;