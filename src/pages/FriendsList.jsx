import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, X, ArrowUpRight, Receipt } from "lucide-react";
import { useResuableQuery } from "../customHooks/useDataQuery";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const Avatar = ({ name = "", colorCode, size = "md" }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";
  return (
    <div
      className={`${sizeClass} rounded-full flex-shrink-0 flex items-center justify-center font-black text-white`}
      style={{ backgroundColor: colorCode || "#6366f1" }}
    >
      {initials}
    </div>
  );
};

const FriendsList = () => {
  const navigate  = useNavigate();
  const currentUserId = useSelector((s) => s.user.user_id);

  const [search,   setSearch]   = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const searchRef = useRef(null);
  const dropRef   = useRef(null);

  /* ── all users for search ── */
  const { data: allUsers = [], isLoading: usersLoading } = useResuableQuery({
    endpoint:  "friends/users",
    withToken: true,
  });

  /* ── recent friends (one per friend, latest first) ── */
  const { data: recentFriends = [], isLoading: txLoading } = useResuableQuery({
    endpoint:  "transactions/recent-friends",
    withToken: true,
  });

  /* ── filter users by search ── */
  const q = search.trim().toLowerCase();
  const filtered = q
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      )
    : [];

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectUser = (user) => {
    setSearch("");
    setShowDrop(false);
    navigate(`/transaction/${user.id}/${encodeURIComponent(user.name)}`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowDrop(true);
  };

  return (
    <section className="p-4 md:p-6 space-y-5">

      {/* ── Search bar ── */}
      <div className="relative" ref={searchRef}>
        <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          onFocus={() => q && setShowDrop(true)}
          placeholder="Search people by name or email…"
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setShowDrop(false); }}
            className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── Search dropdown ── */}
        {showDrop && q && (
          <div
            ref={dropRef}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
          >
            {usersLoading ? (
              <p className="text-xs text-slate-400 text-center py-5">Searching…</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-5">No users found for "{q}"</p>
            ) : (
              filtered.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors text-left border-b border-slate-100 last:border-none"
                >
                  <Avatar name={user.name} colorCode={user.color_code} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    {user.email && (
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Latest Transactions ── */}
      <div>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Recent Activity
        </h2>

        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentFriends.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-600">No activity yet</p>
            <p className="text-xs text-slate-400">
              Search for a person above and start splitting!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentFriends.map((item) => {
              const isFromMe   = Number(item.from_user_id) === Number(currentUserId);
              const typeLabel  = item.type === "request"
                ? (isFromMe ? "You sent a request" : "Sent you a request")
                : (isFromMe ? "You logged an expense" : "Logged an expense with you");

              return (
                <button
                  key={item.other_user_id}
                  onClick={() => navigate(`/transaction/${item.other_user_id}/${encodeURIComponent(item.other_name)}`)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.99] transition-all text-left"
                >
                  <Avatar name={item.other_name} colorCode={item.other_color} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.other_name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.description || typeLabel}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-800">
                      {item.currency} {Number(item.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FriendsList;
