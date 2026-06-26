import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeftRight, Loader2 } from "lucide-react";
import { useResuableQuery } from "../customHooks/useDataQuery";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: groups = [], isLoading: groupsLoading } = useResuableQuery({
    endpoint:  "groups",
    withToken: true,
  });

  const { data: recentFriends = [], isLoading: friendsLoading } = useResuableQuery({
    endpoint:  "transactions/recent-friends",
    withToken: true,
  });

  const visibleGroups  = groups.slice(0, 10);
  const visibleFriends = recentFriends.slice(0, 10);

  return (
    <section className="p-4 md:p-6 space-y-6">

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => navigate("/groups")}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-100"
          >
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">Create Group</span>
          </button>

          <button
            onClick={() => navigate("/friends")}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
          >
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">Personal Transaction</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Groups</h2>

        {groupsLoading ? (
          <div className="flex items-center gap-2 text-slate-400 py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading groups…</span>
          </div>
        ) : visibleGroups.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No groups yet. Create one!</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {visibleGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/group/${group.id}/${encodeURIComponent(group.name)}`)}
                className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl hover:bg-slate-100 active:scale-[0.97] transition-all"
              >
                <div className={`w-16 h-16 rounded-full ${group.color_code} flex items-center justify-center text-white text-xs font-black shadow-lg`}>
                  {getInitials(group.name)}
                </div>
                <p className="text-[12px] font-bold text-slate-700 text-center leading-tight w-full truncate">
                  {group.name.split(" ")[0]}
                </p>
              </button>
            ))}

            {groups.length >= 10 && (
              <button
                onClick={() => navigate("/groups")}
                className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl hover:bg-slate-100 active:scale-[0.97] transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] font-black">
                  More
                </div>
                <p className="text-[12px] font-bold text-slate-400 text-center">Show All</p>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Friends Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Friends</h2>

        {friendsLoading ? (
          <div className="flex items-center gap-2 text-slate-400 py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading friends…</span>
          </div>
        ) : visibleFriends.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No recent interactions yet.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {visibleFriends.map((friend) => (
              <button
                key={friend.other_user_id}
                onClick={() => navigate(`/transaction/${friend.other_user_id}/${encodeURIComponent(friend.other_name)}`)}
                className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl hover:bg-slate-100 active:scale-[0.97] transition-all"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm"
                  style={{ backgroundColor: friend.other_color || "#6366f1" }}
                >
                  {getInitials(friend.other_name)}
                </div>
                <p className="text-[12px] font-bold text-slate-700 text-center leading-tight w-full truncate">
                  {friend.other_name.split(" ")[0]}
                </p>
              </button>
            ))}

            {recentFriends.length >= 10 && (
              <button
                onClick={() => navigate("/friends")}
                className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl hover:bg-slate-100 active:scale-[0.97] transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] font-black">
                  More
                </div>
                <p className="text-[12px] font-bold text-slate-400 text-center">Show All</p>
              </button>
            )}
          </div>
        )}
      </div>

    </section>
  );
};

export default Dashboard;
