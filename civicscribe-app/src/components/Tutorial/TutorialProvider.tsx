"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'scroll' | 'wait';
  actionValue?: string;
  skipable?: boolean;
  page: string; // Which page this step belongs to
}

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  completedSteps: string[];
  isFirstTime: boolean;
}

interface TutorialContextType {
  state: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeStep: (stepId: string) => void;
  setCurrentStep: (step: number) => void;
  highlightElement: (selector: string) => void;
  removeHighlight: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_STEPS: TutorialStep[] = [
  // Landing Page Steps
  {
    id: 'landing-hero',
    title: 'Welcome to CivicScribe!',
    description: 'CivicScribe makes government forms simple by turning them into conversations. Instead of confusing paperwork, you\'ll answer simple questions.',
    target: '[data-tutorial="hero-section"]',
    position: 'center',
    page: 'landing',
    skipable: true
  },
  {
    id: 'landing-get-started',
    title: 'Let\'s Get Started',
    description: 'Click this button to begin finding the government form you need help with.',
    target: '[data-tutorial="get-started-btn"]',
    position: 'top',
    action: 'click',
    page: 'landing'
  },
  
  // Discovery Page Steps
  {
    id: 'discovery-search',
    title: 'Find Your Form',
    description: 'Describe what you need in plain English. For example: "I need food assistance" or "apply for healthcare".',
    target: '[data-tutorial="search-input"]',
    position: 'bottom',
    action: 'type',
    actionValue: 'healthcare application',
    page: 'discovery'
  },
  {
    id: 'discovery-popular',
    title: 'Quick Options',
    description: 'You can also click on these popular searches to quickly find common forms.',
    target: '[data-tutorial="popular-searches"]',
    position: 'top',
    page: 'discovery'
  },
  {
    id: 'discovery-results',
    title: 'Choose Your Form',
    description: 'Review the forms that match your search. Click "Download & Fill" to start the process.',
    target: '[data-tutorial="form-results"]',
    position: 'center',
    action: 'click',
    page: 'discovery'
  },
  
  // Analysis Page Steps
  {
    id: 'analysis-overview',
    title: 'Form Analysis Complete',
    description: 'CivicScribe has analyzed your form and broken it down into simple questions. This usually takes 2-3 minutes.',
    target: '[data-tutorial="analysis-overview"]',
    position: 'center',
    page: 'analysis'
  },
  {
    id: 'analysis-start',
    title: 'Begin Conversation',
    description: 'Click here to start answering questions about your form. Each question is designed to be simple and clear.',
    target: '[data-tutorial="start-conversation"]',
    position: 'top',
    action: 'click',
    page: 'analysis'
  },
  
  // Conversation Page Steps
  {
    id: 'conversation-chat',
    title: 'Answer Simple Questions',
    description: 'Just like texting a friend! Answer each question naturally. The AI will guide you through everything.',
    target: '[data-tutorial="chat-interface"]',
    position: 'center',
    page: 'conversation'
  },
  {
    id: 'conversation-progress',
    title: 'Track Your Progress',
    description: 'See how much of the form you\'ve completed. You can save and come back anytime.',
    target: '[data-tutorial="progress-bar"]',
    position: 'bottom',
    page: 'conversation'
  },
  {
    id: 'conversation-submit',
    title: 'Review Your Answers',
    description: 'When you\'re done, click here to review all your answers before generating the final form.',
    target: '[data-tutorial="review-btn"]',
    position: 'top',
    action: 'click',
    page: 'conversation'
  },
  
  // Review Page Steps
  {
    id: 'review-summary',
    title: 'Review Your Information',
    description: 'Double-check all your answers. You can edit anything by clicking on the sections.',
    target: '[data-tutorial="review-summary"]',
    position: 'center',
    page: 'review'
  },
  {
    id: 'review-generate',
    title: 'Generate Your Form',
    description: 'Click here to create your completed government form. This will be a real PDF ready for submission.',
    target: '[data-tutorial="generate-form"]',
    position: 'top',
    action: 'click',
    page: 'review'
  },
  
  // Submission Page Steps
  {
    id: 'submission-success',
    title: 'Form Generated Successfully!',
    description: 'Your form is ready! Download it and follow the submission instructions.',
    target: '[data-tutorial="success-message"]',
    position: 'center',
    page: 'submission'
  },
  {
    id: 'submission-download',
    title: 'Download Your Form',
    description: 'Click here to download your completed form. You can also get submission instructions.',
    target: '[data-tutorial="download-btn"]',
    position: 'top',
    action: 'click',
    page: 'submission'
  }
];

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TutorialState>({
    isActive: false,
    currentStep: 0,
    steps: TUTORIAL_STEPS,
    completedSteps: [],
    isFirstTime: true
  });

  // Load tutorial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('civicscribe-tutorial');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setState(prev => ({
        ...prev,
        isFirstTime: parsed.isFirstTime ?? true,
        completedSteps: parsed.completedSteps ?? []
      }));
    }
  }, []);

  // Save tutorial state to localStorage
  useEffect(() => {
    localStorage.setItem('civicscribe-tutorial', JSON.stringify({
      isFirstTime: state.isFirstTime,
      completedSteps: state.completedSteps
    }));
  }, [state.isFirstTime, state.completedSteps]);

  const startTutorial = () => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0
    }));
  };

  const nextStep = () => {
    setState(prev => {
      const nextStepIndex = prev.currentStep + 1;
      if (nextStepIndex >= prev.steps.length) {
        // Tutorial completed
        return {
          ...prev,
          isActive: false,
          isFirstTime: false,
          completedSteps: [...prev.completedSteps, ...prev.steps.map(s => s.id)]
        };
      }
      return {
        ...prev,
        currentStep: nextStepIndex
      };
    });
  };

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const skipTutorial = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isFirstTime: false
    }));
  };

  const completeStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }));
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.steps.length - 1))
    }));
  };

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tutorial-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  };

  const contextValue: TutorialContextType = {
    state,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeStep,
    setCurrentStep,
    highlightElement,
    removeHighlight
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
