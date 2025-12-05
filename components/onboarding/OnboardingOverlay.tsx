
import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Activity, Zap } from 'lucide-react';
import BrutalistButton from '../ui/BrutalistButton';

interface Props {
  onComplete: () => void;
}

const STEPS = [
  { title: "Feed", text: "Where the action happens. Project outcomes, earn points.", position: "top-[200px]", icon: <Activity className="text-blue-500" /> },
  { title: "Points", text: "Your fuel. Start with 1,250. Spend wisely.", position: "top-[80px]", icon: <Zap className="text-yellow-500" /> },
  { title: "Move", text: "The big button. Start challenges or commit for later.", position: "bottom-32", icon: <Zap className="text-acid-green" /> }
];

const OnboardingOverlay: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm pointer-events-auto">
      <div className={`absolute w-[90%] max-w-sm left-1/2 -translate-x-1/2 transition-all duration-500 ${step.position}`}>
        <div className="glass-panel bg-white/80 p-6 rounded-[32px] shadow-glow flex flex-col items-center text-center relative">
          <div className="bg-white p-3 rounded-full mb-3 shadow-sm">{step.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">{step.text}</p>
          <BrutalistButton label={currentStep === STEPS.length - 1 ? "Start" : "Next"} onClick={handleNext} className="py-2 px-8 text-sm shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
