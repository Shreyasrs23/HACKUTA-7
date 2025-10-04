// src/app/analysis/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, FileText, Download } from "lucide-react";
import Link from "next/link";
import { mockFormAnalysis } from "@/data/mockData";
import { FormAnalysis, FormSearchResult } from "@/types/formTypes";
import { TutorialOverlay } from "@/components/Tutorial/TutorialOverlay";

export default function FormAnalysisPage() {
  const [selectedForm, setSelectedForm] = useState<FormSearchResult | null>(null);
  const [formAnalysis, setFormAnalysis] = useState<FormAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    // Get selected form from localStorage
    const storedForm = localStorage.getItem('selectedForm');
    if (storedForm) {
      setSelectedForm(JSON.parse(storedForm));
    }

    // Simulate form analysis
    const analyzeForm = async () => {
      setIsAnalyzing(true);
      
      // Simulate analysis steps
      const steps = [
        { progress: 20, message: "Downloading form from government source..." },
        { progress: 40, message: "Analyzing form structure..." },
        { progress: 60, message: "Identifying fillable fields..." },
        { progress: 80, message: "Extracting validation rules..." },
        { progress: 100, message: "Analysis complete!" }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(step.progress);
      }

      setIsAnalyzing(false);
      setFormAnalysis(mockFormAnalysis);
    };

    analyzeForm();
  }, []);

  const handleStartFilling = () => {
    // Store analysis data for next page
    localStorage.setItem('formAnalysis', JSON.stringify(formAnalysis));
    localStorage.setItem('userAnswers', JSON.stringify({}));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/discovery" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Search</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">CivicScribe</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analyzing Form...
                </h2>
                <p className="text-gray-600 mb-4">
                  🤖 I&apos;m analyzing the {selectedForm?.title} form
                </p>
                <Progress value={analysisProgress} className="w-80 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">{analysisProgress}% complete</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {!isAnalyzing && formAnalysis && (
            <div className="space-y-6">
              {/* Analysis Summary */}
              <Card data-tutorial="analysis-overview">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Form Analysis Complete
                  </CardTitle>
                  <CardDescription>
                    Successfully analyzed {selectedForm?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formAnalysis.totalFields}</div>
                      <div className="text-sm text-gray-600">Total Fields</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formAnalysis.requiredFields}</div>
                      <div className="text-sm text-gray-600">Required Fields</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{formAnalysis.sections.length}</div>
                      <div className="text-sm text-gray-600">Sections</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{formAnalysis.estimatedTime}</div>
                      <div className="text-sm text-gray-600">Est. Time</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href="/conversation">
                      <Button 
                        onClick={handleStartFilling} 
                        className="flex-1"
                        data-tutorial="start-conversation"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Start Filling Form
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Original
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Sections */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Sections</CardTitle>
                  <CardDescription>
                    The form is organized into {formAnalysis.sections.length} main sections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formAnalysis.sections.map((section, index) => (
                      <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{section.title}</h4>
                            <p className="text-sm text-gray-600">{section.fields.length} fields</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {section.fields.length} fields
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                  <CardDescription>
                    You'll need these documents to complete your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formAnalysis.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Form Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Preview</CardTitle>
                  <CardDescription>
                    Here's what the official form looks like
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500 mb-4">
                      <FileText className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">{selectedForm?.title}</p>
                      <p className="text-sm">Form {selectedForm?.formNumber}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>1. Full Name:</span>
                        <span className="text-gray-400">[________________]</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Social Security Number:</span>
                        <span className="text-gray-400">[________]</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Date of Birth:</span>
                        <span className="text-gray-400">[____/____/____]</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. Household Size:</span>
                        <span className="text-gray-400">[____]</span>
                      </div>
                      <div className="flex justify-between">
                        <span>5. Monthly Income:</span>
                        <span className="text-gray-400">$[________]</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Tutorial Components */}
      <TutorialOverlay currentPage="analysis" />
    </div>
  );
}
