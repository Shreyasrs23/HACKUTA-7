"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Auto-redirect to Auth0 universal login
    loginWithRedirect();
  }, [loginWithRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redirecting to Sign In…</CardTitle>
          <CardDescription>If you are not redirected, click the button below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => loginWithRedirect()}>Continue to Auth0</Button>
        </CardContent>
      </Card>
    </div>
  );
}
