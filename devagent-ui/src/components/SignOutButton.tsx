"use client";

export function SignOutButton() {
  // TODO: Add a check for authentication status
  const isAuthenticated = true; 

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    // e.g., remove token from local storage, redirect to login
    console.log("Signing out...");
    alert("Signing out!");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded bg-white text-secondary border border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-sm hover:shadow"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
}
