// src/app/discovery/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Search, Download, Eye, Clock, CheckCircle, FileText, Building2 } from "lucide-react";
import Link from "next/link";
import { mockFormSearchResults } from "@/data/mockData";
import { FormSearchResult } from "@/types/formTypes";
import { TutorialOverlay } from "@/components/Tutorial/TutorialOverlay";

export default function FormDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FormSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormSearchResult | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a more flexible search function
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filteredResults = mockFormSearchResults.filter(form => {
      const searchableText = [
        form.title.toLowerCase(),
        form.formNumber.toLowerCase(),
        form.source.toLowerCase(),
        ...form.requirements.map(req => req.toLowerCase())
      ].join(' ');
      
      // Check if any search term matches any part of the searchable text
      return searchTerms.some(term => searchableText.includes(term));
    });
    
    setSearchResults(filteredResults);
    setIsSearching(false);
  };

  const handleFormSelect = (form: FormSearchResult) => {
    setSelectedForm(form);
    // Store selected form in localStorage for next page
    localStorage.setItem('selectedForm', JSON.stringify(form));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600 font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CivicScribe
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-blue-600 border-blue-200">
                Find Your Form
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              What government form do you need help with?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Describe what you need in plain English, and we&apos;ll find the right official form for you.
            </p>
            
            <div className="flex gap-3 max-w-3xl mx-auto mb-8">
              <Input
                placeholder="Search: 'I need food assistance' or 'apply for housing'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="flex-1 h-14 text-lg px-6 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                data-tutorial="search-input"
              />
              <Button 
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="mt-8" data-tutorial="popular-searches">
              <p className="text-sm text-gray-500 mb-4 font-medium">Popular searches:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["housing assistance", "unemployment benefits", "healthcare application", "tax forms"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch(term);
                    }}
                    className="px-4 py-2 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <p className="text-gray-600">🤖 AI is searching government databases...</p>
              <Progress value={60} className="w-64 mx-auto mt-4" />
            </div>
          )}

          {searchResults.length > 0 && !isSearching && (
            <div className="space-y-4" data-tutorial="form-results">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Found {searchResults.length} official form{searchResults.length !== 1 ? 's' : ''}:
                </h2>
              </div>

              {searchResults.map((form) => (
                <Card key={form.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-2">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-2">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          {form.title}
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                            {form.formNumber}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          <span className="font-medium">Source:</span> {form.source} | 
                          <span className="font-medium"> Updated:</span> {form.lastUpdated}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                          <Clock className="h-3 w-3" />
                          {form.estimatedTime}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          {form.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Required Documents:</h4>
                      <div className="flex flex-wrap gap-2">
                        {form.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href="/analysis">
                        <Button 
                          onClick={() => handleFormSelect(form)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download & Fill
                        </Button>
                      </Link>
                      <Button variant="outline" className="border-2 hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchResults.length === 0 && !isSearching && searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No forms found for your search.</p>
              <p className="text-sm text-gray-500">
                Try different keywords or browse our popular categories above.
              </p>
            </div>
          )}

          {/* Initial State */}
          {searchResults.length === 0 && !isSearching && !searchQuery && (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to find your form?
                </h3>
                <p className="text-gray-600 mb-4">
                  Search for any government form or service you need help with.
                </p>
                <p className="text-sm text-gray-500">
                  Examples: "food assistance", "housing application", "unemployment benefits"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tutorial Components */}
      <TutorialOverlay currentPage="discovery" />
    </div>
  );
}
