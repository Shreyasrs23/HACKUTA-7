// src/app/submission/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, Mail, Phone, ExternalLink, FileText, Bot } from "lucide-react";
import Link from "next/link";
import { mockSubmissionResult } from "@/data/mockData";
import { TutorialOverlay } from "@/components/Tutorial/TutorialOverlay";

export default function SubmissionPage() {
  const [submissionStatus, setSubmissionStatus] = useState<'submitting' | 'complete' | 'error'>('submitting');
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(mockSubmissionResult);

  useEffect(() => {
    // Simulate submission process
    const submitForm = async () => {
      const steps = [
        { progress: 20, message: "Form validation complete" },
        { progress: 40, message: "Digital signature applied" },
        { progress: 60, message: "Encrypting data for secure transmission" },
        { progress: 80, message: "Submitting to USDA.gov..." },
        { progress: 100, message: "Submission successful!" }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmissionProgress(step.progress);
      }

      setSubmissionStatus('complete');
    };

    submitForm();
  }, []);

  const handleStartAnother = () => {
    // Clear localStorage and start fresh
    localStorage.removeItem('selectedForm');
    localStorage.removeItem('formAnalysis');
    localStorage.removeItem('userAnswers');
    localStorage.removeItem('submissionData');
    window.location.href = '/discovery';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/review" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Review</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">CivicScribe</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Submission Progress */}
          {submissionStatus === 'submitting' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Submitting Your Application...
                </h2>
                <p className="text-gray-600 mb-4">
                  🤖 Submitting your SNAP Benefits Application to the USDA government portal...
                </p>
                <Progress value={submissionProgress} className="w-80 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">{submissionProgress}% complete</p>
              </div>
            </div>
          )}

          {/* Submission Complete */}
          {submissionStatus === 'complete' && (
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center" data-tutorial="success-message">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Submission Successful!
                </h1>
                <p className="text-lg text-gray-600">
                  Your SNAP Benefits Application has been submitted to the government.
                </p>
              </div>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>
                    Your application has been successfully submitted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Application ID:</span>
                        <span className="font-medium">{submissionResult.applicationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">
                          {new Date(submissionResult.confirmation.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Under Review
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Response:</span>
                        <span className="font-medium">{submissionResult.confirmation.expectedResponse}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          Confirmation email sent to: {submissionResult.confirmation.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          SMS notification sent to: {submissionResult.confirmation.sms}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                        <a 
                          href={submissionResult.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Track your application
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>
                    Here's what happens next with your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submissionResult.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <p className="text-gray-900">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bot Message */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">Congratulations!</h3>
                      <p className="text-gray-600 mb-4">
                        I've successfully submitted your SNAP Benefits Application to the USDA government portal. 
                        You should receive a confirmation letter within 7 days, and your interview will be scheduled 
                        for January 22, 2024. Don't forget to bring your required documents!
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 Pro tip: Save your application ID ({submissionResult.applicationId}) 
                          for easy reference when contacting the SNAP office.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  data-tutorial="download-btn"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Copy
                </Button>
                <Button size="lg" onClick={handleStartAnother}>
                  Start Another Application
                </Button>
              </div>

              {/* Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    We're here to assist you throughout the process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Application Status</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Check the status of your application anytime
                      </p>
                      <Button variant="outline" size="sm">
                        Check Status
                      </Button>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Get Support</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Contact our support team for assistance
                      </p>
                      <Button variant="outline" size="sm">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Tutorial Components */}
      <TutorialOverlay currentPage="submission" />
    </div>
  );
}
