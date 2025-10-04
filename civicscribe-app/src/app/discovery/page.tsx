// src/app/discovery/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Search, Download, Eye, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { mockFormSearchResults } from "@/data/mockData";
import { FormSearchResult } from "@/types/formTypes";

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
    
    // Filter mock results based on query
    const filteredResults = mockFormSearchResults.filter(form =>
      form.title.toLowerCase().includes(query.toLowerCase()) ||
      form.requirements.some(req => req.toLowerCase().includes(query.toLowerCase()))
    );
    
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
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">CivicScribe</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              What government form do you need help with?
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Describe what you need in plain English, and we'll find the right official form for you.
            </p>
            
            <div className="flex gap-2 max-w-2xl mx-auto">
              <Input
                placeholder="Search: 'I need food assistance' or 'apply for housing'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["housing assistance", "unemployment benefits", "healthcare application", "tax forms"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch(term);
                    }}
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
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Found {searchResults.length} official form{searchResults.length !== 1 ? 's' : ''}:
                </h2>
              </div>

              {searchResults.map((form) => (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <span>📄 {form.title}</span>
                          <Badge variant="secondary">{form.formNumber}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Source: {form.source} | Updated: {form.lastUpdated}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {form.estimatedTime}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {form.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Required Documents:</h4>
                      <div className="flex flex-wrap gap-2">
                        {form.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href="/analysis">
                        <Button 
                          onClick={() => handleFormSelect(form)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download & Fill
                        </Button>
                      </Link>
                      <Button variant="outline">
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
    </div>
  );
}
