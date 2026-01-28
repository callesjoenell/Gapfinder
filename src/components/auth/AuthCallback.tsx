import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component handles the redirect after magic link click
// Convex Auth processes the token automatically via http routes
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to let auth complete, then redirect
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}
