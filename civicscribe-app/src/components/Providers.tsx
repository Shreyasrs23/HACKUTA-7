"use client";

import React from "react";
import { TutorialProvider } from "@/components/Tutorial/TutorialProvider";
import { Auth0Provider } from "@auth0/auth0-react";

const safeTrim = (v?: string) => (typeof v === "string" ? v.trim() : undefined);
const domain = safeTrim(process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string | undefined);
const clientId = safeTrim(process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string | undefined);
const redirectUri = typeof window !== "undefined" ? window.location.origin : undefined;

export default function Providers({ children }: { children: React.ReactNode }) {
  // Allow app to run even if env not provided (dev/demo)
  if (!domain || !clientId) {
    return <TutorialProvider>{children}</TutorialProvider>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      cacheLocation="localstorage"
    >
      <TutorialProvider>{children}</TutorialProvider>
    </Auth0Provider>
  );
}
