"use client";

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';
import { useTutorial } from './TutorialProvider';

interface TutorialOverlayProps {
  currentPage: string;
}

export function TutorialOverlay({ currentPage }: TutorialOverlayProps) {
  const { state, nextStep, prevStep, skipTutorial, highlightElement, removeHighlight } = useTutorial();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Get current step for this page
  const currentStepData = state.steps[state.currentStep];
  const isCurrentPageStep = currentStepData?.page === currentPage;
  const isActive = state.isActive && isCurrentPageStep;

  useEffect(() => {
    if (isActive && currentStepData) {
      // Highlight the target element
      setTimeout(() => {
        highlightElement(currentStepData.target);
      }, 100);

      // Auto-scroll to element
      const element = document.querySelector(currentStepData.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      removeHighlight();
    }

    return () => {
      removeHighlight();
    };
  }, [isActive, currentStepData, highlightElement, removeHighlight]);

  if (!isActive || !currentStepData) {
    return null;
  }

  const progress = ((state.currentStep + 1) / state.steps.length) * 100;
  const isLastStep = state.currentStep === state.steps.length - 1;
  const isFirstStep = state.currentStep === 0;

  const getTooltipPosition = () => {
    const element = document.querySelector(currentStepData.target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = '50%';
    let left = '50%';
    let transform = 'translate(-50%, -50%)';

    switch (currentStepData.position) {
      case 'top':
        top = `${Math.max(20, rect.top - 20)}px`;
        left = `${rect.left + rect.width / 2}px`;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = `${Math.min(viewportHeight - 20, rect.bottom + 20)}px`;
        left = `${rect.left + rect.width / 2}px`;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = `${rect.top + rect.height / 2}px`;
        left = `${Math.max(20, rect.left - 20)}px`;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = `${rect.top + rect.height / 2}px`;
        left = `${Math.min(viewportWidth - 20, rect.right + 20)}px`;
        transform = 'translate(0, -50%)';
        break;
      case 'center':
      default:
        top = '50%';
        left = '50%';
        transform = 'translate(-50%, -50%)';
        break;
    }

    return { top, left, transform };
  };

  const position = getTooltipPosition();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" />
      
      {/* Highlight overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <div className="absolute inset-0 bg-black/30" />
        <div 
          className="absolute bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-[101] pointer-events-auto"
          style={{
            top: position.top,
            left: position.left,
            transform: position.transform,
            width: '320px',
            maxWidth: '90vw'
          }}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Step {state.currentStep + 1} of {state.steps.length}
                  </Badge>
                  {currentStepData.skipable && (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTutorial}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {currentStepData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 mb-4 leading-relaxed">
                {currentStepData.description}
              </p>
              
              {/* Progress bar */}
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={isFirstStep}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipTutorial}
                    className="h-8"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Skip Tutorial
                  </Button>
                </div>
                
                <Button
                  onClick={nextStep}
                  className="h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLastStep ? (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Tutorial trigger button component
export function TutorialTrigger() {
  const { state, startTutorial } = useTutorial();

  if (!state.isFirstTime) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={startTutorial}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Play className="h-4 w-4 mr-2" />
        Take Tour
      </Button>
    </div>
  );
}
