"use client";

export default function UserList({
  users,
  selectedUser,
  onSelectUser,
  unreadCounts,
  lastMessages,
  typingUsers,
}) {
  if (users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-slate-500 text-sm text-center">
          他のオンラインユーザーがいません
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {users.map((u) => {
        const isSelected = selectedUser?.id === u.id;
        const unread = unreadCounts[u.id] || 0;
        const lastMsg = lastMessages[u.id];
        const isTyping = typingUsers.has(u.id);

        return (
          <button
            key={u.id}
            onClick={() => onSelectUser(u)}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 hover:bg-white/5 ${
              isSelected
                ? "bg-violet-600/10 border-l-2 border-violet-500"
                : "border-l-2 border-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                    : "bg-dark-bubble text-slate-300"
                }`}
              >
                {u.username[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet-400 rounded-full border-2 border-dark-sidebar"></div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200 truncate">
                  {u.username}
                </span>
                {unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {isTyping
                  ? "入力中..."
                  : lastMsg
                    ? lastMsg.content
                    : "メッセージはまだありません"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
