import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Adjust this to match your actual store shape if it differs
// (i.e. the key you gave authSlice inside combineReducers/configureStore).
interface RootState {
  auth: {
    user: { Role?: string } | null;
  };
}

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);

  // not logged in at all — send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logged in but not an admin — block, don't redirect silently
  if (user.Role !== "Admin") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-950 text-gray-100">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-500">403</p>
          <h1 className="mt-2 text-xl font-semibold">You don't have access to this page</h1>
          <p className="mt-1 text-sm text-gray-400">Admin panel is restricted to Admin accounts.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}