import React, { useState } from 'react';
import { LayoutGrid, Hammer, Swords, Trophy } from 'lucide-react';

// Onboarding steps data
const ONBOARDING_STEPS = [
  {
    icon: LayoutGrid,
    title: "Spin the Slots",
    text: "Welcome to RoboSlots! Spin the Slot Machine to win Coins and powerful Robot Parts."
  },
  {
    icon: Hammer,
    title: "Assemble Your Mech",
    text: "Collect 5 unique part types (Head, Body, Arms, Legs, Weapon) and assemble your custom mech in the Workshop."
  },
  {
    icon: Swords,
    title: "Battle for Glory",
    text: "Take your completed robot to the Battle Arena to fight against other mechs and climb the ranks!"
  },
  {
    icon: Trophy,
    title: "Rule the World",
    text: "Build the strongest robot, dominate the leaderboard, and become the ultimate champion!"
  }
];

interface OnboardingProps {
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const currentStep = ONBOARDING_STEPS[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl shadow-cyan-900/40 w-full max-w-sm p-6 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center mb-4">
          <Icon size={40} className="text-cyan-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">{currentStep.title}</h2>
        <p className="text-slate-300 mb-6">{currentStep.text}</p>
        
        {/* Progress Dots */}
        <div className="flex space-x-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index === step ? 'bg-cyan-400' : 'bg-slate-600'}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white rounded-lg font-bold font-display tracking-wider transition-all active:scale-95"
        >
          {step < ONBOARDING_STEPS.length - 1 ? 'Next' : 'Let\'s Go!'}
        </button>
        {step < ONBOARDING_STEPS.length - 1 && (
             <button onClick={onClose} className="mt-3 text-slate-500 text-xs hover:text-white transition-colors">
                 Skip Tutorial
             </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
