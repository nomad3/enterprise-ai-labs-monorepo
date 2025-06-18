"use client";

// import { Authenticated, Unauthenticated, useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";
import { SignInForm } from "../components/SignInForm";
import { SignOutButton } from "../components/SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "../components/Dashboard";
import { TenantSetup } from "../components/TenantSetup";
import { LandingPage } from "../components/LandingPage";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Authenticated>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AF</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">AgentForge</h2>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1">
          <AuthenticatedContent />
        </main>
      </Authenticated>
      
      <Unauthenticated> */}
        <LandingPage />
      {/* </Unauthenticated> */}
      
      <Toaster />
    </div>
  );
}

function AuthenticatedContent() {
  // const currentUser = useQuery(api.users.getCurrentUser);

  // if (currentUser === undefined) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[400px]">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // return currentUser?.tenant ? <Dashboard /> : <TenantSetup />;
  return <Dashboard />;
}
