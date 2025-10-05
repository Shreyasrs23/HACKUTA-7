// src/components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, LogOut } from "lucide-react";
import Link from "next/link";

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CivicScribe
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</Link>
          <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How it Works</Link>
          <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</Link>
          {!user && (
            <>
              <a href="/auth/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </a>
              <a href="/auth/login?screen_hint=signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Sign Up
                </Button>
              </a>
            </>
          )}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.picture || ''} alt={user.name || 'User'} />
                  <AvatarFallback>{user.name?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.name || user.email}</span>
              </div>
              <a href="/auth/logout">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
