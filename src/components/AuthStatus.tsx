'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="animate-pulse w-20 h-8 bg-slate-700 rounded"></div>;
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white">{session.user?.name || "User"}</p>
          <p className="text-xs text-slate-400">{session.user?.clusterLabel || "Unassigned"}</p>
        </div>
        <button 
          onClick={() => signOut()}
          className="text-xs text-slate-400 hover:text-white underline"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const handleGuestLogin = () => {
    let guestId = localStorage.getItem("parallax_guest_id");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("parallax_guest_id", guestId);
    }
    signIn("guest", { uuid: guestId, callbackUrl: "/" });
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleGuestLogin}
        className="px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 text-sm font-bold rounded transition-colors"
      >
        Guest Mode
      </button>
      <button
        onClick={() => signIn("google")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg transition-colors"
      >
        Sign In
      </button>
    </div>
  );
}
