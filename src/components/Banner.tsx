// src/components/Banner.tsx
import { signInWithGoogle, signOut, useAuthState } from "../utilities/firebase";

interface BannerProps {
  title: string;
}

const Banner = ({ title }: BannerProps) => {
  const { user, isAuthenticated, isInitialLoading } = useAuthState();

  return (
    <header className="p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold">{title}</h1>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {isInitialLoading
              ? "Checking sign-in..."
              : isAuthenticated
              ? `Welcome, ${user?.displayName ?? "user"}`
              : "Welcome, guest"}
          </div>

          {/* Sign in / Sign out button */}
          {isAuthenticated ? (
            <button
              className="btn btn-secondary px-3 py-1"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          ) : (
            <button
              className="btn btn-primary px-3 py-1"
              onClick={() => signInWithGoogle()}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Banner;
