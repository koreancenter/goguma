import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  targetId: string;
  titleKey: string;
  descriptionKey: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  isCompleted: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem('goguma_tutorial_completed') === 'true';
  });

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      targetId: 'workspace-header',
      titleKey: 'onboarding_welcome_title',
      descriptionKey: 'onboarding_welcome_desc',
      position: 'center'
    },
    {
      id: 'project-config',
      targetId: 'project-name-input',
      titleKey: 'onboarding_platform_title',
      descriptionKey: 'onboarding_platform_desc',
      position: 'bottom'
    },
    {
      id: 'strategic-context',
      targetId: 'vision-context-section',
      titleKey: 'onboarding_context_title',
      descriptionKey: 'onboarding_context_desc',
      position: 'top'
    },
    {
      id: 'sdd-dispatch',
      targetId: 'dispatch-button',
      titleKey: 'onboarding_dispatch_title',
      descriptionKey: 'onboarding_dispatch_desc',
      position: 'left'
    }
  ];

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
  };

  const stopTutorial = () => {
    setIsActive(false);
    setIsCompleted(true);
    localStorage.setItem('goguma_tutorial_completed', 'true');
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      stopTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <TutorialContext.Provider value={{
      isActive,
      currentStepIndex,
      steps,
      startTutorial,
      stopTutorial,
      nextStep,
      prevStep,
      isCompleted
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
