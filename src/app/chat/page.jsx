"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import UserList from "@/components/UserList";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      const partnerId =
        message.senderId === user.id ? message.receiverId : message.senderId;
      setLastMessages((prev) => ({ ...prev, [partnerId]: message }));

      if (
        message.senderId !== user.id &&
        (!selectedUser || selectedUser.id !== message.senderId)
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));
      }
    };

    const handleRead = ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((m) => (messageIds.includes(m.id) ? { ...m, read: true } : m))
      );
    };

    const handleTypingStart = ({ senderId }) => {
      setTypingUsers((prev) => new Set([...prev, senderId]));
    };

    const handleTypingStop = ({ senderId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(senderId);
        return next;
      });
    };

    socket.on("message:receive", handleReceive);
    socket.on("message:read", handleRead);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("message:read", handleRead);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, user, selectedUser]);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `/api/messages?userId=${user.id}&partnerId=${selectedUser.id}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
    };
    fetchMessages();

    setUnreadCounts((prev) => ({ ...prev, [selectedUser.id]: 0 }));
  }, [selectedUser, user]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (!socket || !selectedUser || !user) return;

    const unreadMessages = messages.filter(
      (m) => m.senderId === selectedUser.id && !m.read
    );
    if (unreadMessages.length > 0) {
      socket.emit("message:read", {
        messageIds: unreadMessages.map((m) => m.id),
        readerId: user.id,
      });
    }
  }, [messages, selectedUser, user, socket]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMobileShowChat(true);
  };

  const handleBack = () => {
    setMobileShowChat(false);
  };

  const handleSendMessage = (content) => {
    if (!socket || !selectedUser) return;
    socket.emit("message:send", {
      senderId: user.id,
      receiverId: selectedUser.id,
      content,
    });
  };

  if (!user) return null;

  const otherUsers = onlineUsers.filter((u) => u.id !== user.id);

  return (
    <div className="h-screen flex bg-dark-main">
      {/* Sidebar */}
      <div
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 flex-col bg-dark-sidebar border-r border-white/5`}
      >
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">チャット</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <span className="text-sm text-slate-400">{user.username}</span>
            </div>
          </div>
        </div>
        <UserList
          users={otherUsers}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          unreadCounts={unreadCounts}
          lastMessages={lastMessages}
          typingUsers={typingUsers}
        />
      </div>

      {/* Chat area */}
      <div
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col`}
      >
        {selectedUser ? (
          <ChatWindow
            currentUser={user}
            selectedUser={selectedUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            socket={socket}
            isTyping={typingUsers.has(selectedUser.id)}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-dark-sidebar rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-slate-400 text-lg">
                ユーザーを選択してチャットを開始
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
