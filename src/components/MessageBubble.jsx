"use client";

export default function MessageBubble({ message, isOwn }) {
  const time = new Date(message.createdAt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex animate-fadeIn ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
          isOwn
            ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-md"
            : "bg-dark-bubble text-slate-200 rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}
        >
          <span
            className={`text-[10px] ${isOwn ? "text-white/60" : "text-slate-500"}`}
          >
            {time}
          </span>
          {isOwn && (
            <span className={`text-[10px] ${message.read ? "text-violet-300" : "text-white/40"}`}>
              {message.read ? "既読" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
