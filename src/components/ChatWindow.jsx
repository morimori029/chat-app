"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  onSendMessage,
  socket,
  isTyping,
  onBack,
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset input when switching users
  useEffect(() => {
    setInput("");
  }, [selectedUser]);

  const emitTypingStop = useCallback(() => {
    if (isTypingRef.current && socket) {
      socket.emit("typing:stop", {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
      });
      isTypingRef.current = false;
    }
  }, [socket, currentUser, selectedUser]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!socket) return;

    if (!isTypingRef.current) {
      socket.emit("typing:start", {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
      });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(emitTypingStop, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInput("");
    emitTypingStop();
    clearTimeout(typingTimeoutRef.current);
  };

  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === selectedUser.id) ||
      (m.senderId === selectedUser.id && m.receiverId === currentUser.id)
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-dark-sidebar/50 backdrop-blur-sm flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-sm font-semibold text-white">
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            {selectedUser.username}
          </h3>
          <p className="text-xs text-violet-400">オンライン</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversationMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">
              {selectedUser.username} にメッセージを送ってみましょう
            </p>
          </div>
        )}
        {conversationMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUser.id}
          />
        ))}
        {isTyping && <TypingIndicator username={selectedUser.username} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-dark-input border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2.5 bg-dark-sidebar border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
