import React from "react";

export default function Navbar(){
    return(
        <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <a href="/" className="text-lg font-semibold tracking-tight">
          QuestGen<span className="text-white/60">AI</span>
        </a>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 transition"
          >
            GitHub
          </a>
          <button
            className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-white/90 transition"
            onClick={() => alert("Connected! (placeholder)")}
          >
            Connect
          </button>
        </div>
      </nav>
    </header>
    );
}