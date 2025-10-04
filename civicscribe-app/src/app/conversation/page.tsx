// src/app/conversation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Save, Eye, Bot, User } from "lucide-react";
import Link from "next/link";
import { FormAnalysis, FormField, UserAnswers } from "@/types/formTypes";
import { TutorialOverlay } from "@/components/Tutorial/TutorialOverlay";

export default function ConversationPage() {
  const [formAnalysis, setFormAnalysis] = useState<FormAnalysis | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load form analysis from localStorage
    const storedAnalysis = localStorage.getItem('formAnalysis');
    const storedAnswers = localStorage.getItem('userAnswers');
    
    if (storedAnalysis) {
      setFormAnalysis(JSON.parse(storedAnalysis));
    }
    if (storedAnswers) {
      setUserAnswers(JSON.parse(storedAnswers));
    }
    
    setIsLoading(false);
  }, []);

  const currentSection = formAnalysis?.sections[currentSectionIndex];
  const currentField = currentSection?.fields[currentFieldIndex];
  const totalFields = formAnalysis?.sections.reduce((acc, section) => acc + section.fields.length, 0) || 0;
  const completedFields = Object.keys(userAnswers).length;
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  const handleAnswerChange = (value: any) => {
    if (currentField) {
      setUserAnswers(prev => ({
        ...prev,
        [currentField.id]: value
      }));
    }
  };

  const handleNext = () => {
    if (!currentSection || !formAnalysis) return;
    
    // Save progress before moving to next field
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    
    if (currentFieldIndex < currentSection.fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else if (currentSectionIndex < formAnalysis.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentFieldIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else if (currentSectionIndex > 0 && formAnalysis) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      const prevSection = formAnalysis.sections[currentSectionIndex - 1];
      setCurrentFieldIndex(prevSection.fields.length - 1);
    }
  };

  const handleSaveProgress = () => {
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    // Show success message
    alert('Progress saved successfully!');
  };

  const handleReviewAndSubmit = () => {
    // Save all answers before navigating to review
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    // Navigate to review page
    window.location.href = '/review';
  };

  const isLastField = formAnalysis && currentSection && 
                     currentSectionIndex === formAnalysis.sections.length - 1 && 
                     currentFieldIndex === currentSection.fields.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formAnalysis || !currentField) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No form data found</h2>
          <Link href="/discovery">
            <Button>Go to Form Discovery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/analysis" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Analysis</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">CivicScribe</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {formAnalysis.formId === 'snap-001' ? 'SNAP Benefits Application' : 'Form Application'}
              </h1>
              <Badge variant="outline">
                {completedFields} of {totalFields} fields completed
              </Badge>
            </div>
            <Progress value={progress} className="w-full" data-tutorial="progress-bar" />
            <p className="text-sm text-gray-600 mt-2">
              Section {currentSectionIndex + 1} of {formAnalysis.sections.length}: {currentSection.title}
            </p>
          </div>

          {/* Chat Interface */}
          <div className="space-y-6" data-tutorial="chat-interface">
            {/* Bot Message */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">
                      Perfect! I've analyzed the form. Let's fill it out together. 
                      I'll ask simple questions and fill the official form for you.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        💡 This will go in the "{currentField.mapping.formField}" field on the official form
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {currentField.question}
                    </h3>
                    {currentField.helpText && (
                      <p className="text-sm text-gray-600 mb-4">
                        {currentField.helpText}
                      </p>
                    )}
                    
                    {/* Input Field */}
                    <div className="space-y-4">
                      {currentField.type === 'text' && (
                        <Input
                          placeholder="Enter your answer..."
                          value={userAnswers[currentField.id] || ''}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-full"
                        />
                      )}
                      
                      {currentField.type === 'ssn' && (
                        <Input
                          placeholder="123-45-6789"
                          value={userAnswers[currentField.id] || ''}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-full"
                          maxLength={11}
                        />
                      )}
                      
                      {currentField.type === 'date' && (
                        <Input
                          type="date"
                          value={userAnswers[currentField.id] || ''}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-full"
                        />
                      )}
                      
                      {currentField.type === 'number' && (
                        <Input
                          type="number"
                          placeholder="Enter number..."
                          value={userAnswers[currentField.id] || ''}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-full"
                        />
                      )}
                      
                      {currentField.type === 'email' && (
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={userAnswers[currentField.id] || ''}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-full"
                        />
                      )}
                      
                      {currentField.type === 'radio' && currentField.options && (
                        <div className="space-y-2">
                          {currentField.options.map((option) => (
                            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={currentField.id}
                                value={option.value}
                                checked={userAnswers[currentField.id] === option.value}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                className="text-blue-600"
                              />
                              <span className="text-gray-900">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Answer Display */}
            {userAnswers[currentField.id] && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        {userAnswers[currentField.id]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSectionIndex === 0 && currentFieldIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" onClick={handleSaveProgress}>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Form
              </Button>
              {isLastField ? (
                <Button 
                  onClick={handleReviewAndSubmit}
                  data-tutorial="review-btn"
                >
                  Review & Submit
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Components */}
      <TutorialOverlay currentPage="conversation" />
    </div>
  );
}
