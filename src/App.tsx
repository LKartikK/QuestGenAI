import React from "react";
import { Outlet, Link } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* quick nav for now */}
        <div className="mb-6 flex gap-3 text-sm">
          <Link className="rounded-xl border border-white/10 px-3 py-1.5 hover:bg-white/10" to="/">Home</Link>
          <Link className="rounded-xl border border-white/10 px-3 py-1.5 hover:bg-white/10" to="/generate">Generate</Link>
          <Link className="rounded-xl border border-white/10 px-3 py-1.5 hover:bg-white/10" to="/results">Results</Link>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
