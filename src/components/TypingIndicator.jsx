"use client";

export default function TypingIndicator({ username }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-fadeIn">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></div>
      </div>
      <span className="text-xs text-slate-500">{username} が入力中...</span>
    </div>
  );
}
