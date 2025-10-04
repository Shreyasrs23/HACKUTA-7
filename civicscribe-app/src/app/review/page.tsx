// src/app/review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, FileText, Download, ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import { FormAnalysis, UserAnswers } from "@/types/formTypes";
import { TutorialOverlay } from "@/components/Tutorial/TutorialOverlay";

export default function ReviewPage() {
  const [formAnalysis, setFormAnalysis] = useState<FormAnalysis | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const storedAnalysis = localStorage.getItem('formAnalysis');
    const storedAnswers = localStorage.getItem('userAnswers');
    
    console.log('Review page - storedAnalysis:', storedAnalysis);
    console.log('Review page - storedAnswers:', storedAnswers);
    
    if (storedAnalysis) {
      setFormAnalysis(JSON.parse(storedAnalysis));
    }
    if (storedAnswers) {
      setUserAnswers(JSON.parse(storedAnswers));
    }
    
    setIsLoading(false);
  }, []);

  const handleEditSection = (sectionId: string) => {
    // Find section index and navigate back to conversation
    const sectionIndex = formAnalysis?.sections.findIndex(s => s.id === sectionId) || 0;
    localStorage.setItem('editSection', sectionIndex.toString());
    // Navigate back to conversation page
    window.location.href = '/conversation';
  };

  const handleSubmit = () => {
    // Store submission data
    localStorage.setItem('submissionData', JSON.stringify({
      formAnalysis,
      userAnswers,
      submittedAt: new Date().toISOString()
    }));
    // Navigate to submission page
    window.location.href = '/submission';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formAnalysis) {
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
          <Link href="/conversation" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Questions</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">CivicScribe</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Review Your Application
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              🤖 I've filled out your SNAP Benefits Application based on your answers. 
              Please review everything before I submit it to the government.
            </p>
          </div>

          {/* Form Summary */}
          <Card className="mb-8" data-tutorial="review-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                SNAP Benefits Application - Form SNAP-001
              </CardTitle>
              <CardDescription>
                Review all sections before submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formAnalysis.sections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {section.fields.filter(field => userAnswers[field.id]).length} of {section.fields.length} fields
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSection(section.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Section
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {section.fields.map((field) => (
                        <div key={field.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <span className="font-medium text-gray-900">{field.mapping.formField}:</span>
                            <span className="text-gray-600 ml-2">
                              {userAnswers[field.id] || (
                                <span className="text-red-500 italic">Not answered</span>
                              )}
                            </span>
                          </div>
                          {userAnswers[field.id] && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Documents Checklist */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Required Documents Checklist</CardTitle>
              <CardDescription>
                You'll need these documents to complete your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formAnalysis.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-900">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bot Message */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Ready to Submit?</h3>
                  <p className="text-gray-600 mb-4">
                    I've filled out your SNAP Benefits Application with all the information you provided. 
                    The form will be submitted directly to the USDA government portal, and you'll receive 
                    a confirmation with your application ID and tracking information.
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ All required fields completed<br/>
                      ✅ Form validation passed<br/>
                      ✅ Ready for government submission
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="lg">
              Save Draft
            </Button>
            <Button 
              size="lg" 
              onClick={handleSubmit}
              data-tutorial="generate-form"
            >
              Submit to Government
            </Button>
          </div>

          {/* Submission Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By submitting, you agree that CivicScribe will submit your application 
              to the official government portal on your behalf.
            </p>
          </div>
        </div>
      </div>
      
      {/* Tutorial Components */}
      <TutorialOverlay currentPage="review" />
    </div>
  );
}
