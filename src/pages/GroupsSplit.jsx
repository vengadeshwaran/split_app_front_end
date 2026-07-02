import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { useResuableQuery } from "../customHooks/useDataQuery";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const GroupsSplit = () => {
  const navigate = useNavigate();

  const { data: groups = [], isLoading } = useResuableQuery({
    endpoint:  "groups",
    withToken: true,
  });

  return (
    <section className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Groups</h2>
        <button
          onClick={() => navigate("/groups/new")}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Group
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 animate-pulse">
              <div className="w-11 h-11 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 flex flex-col items-center gap-3 text-center shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-slate-600">No groups yet</p>
          <p className="text-xs text-slate-400">Create a group to start splitting bills with friends.</p>
          <button
            onClick={() => navigate("/groups/new")}
            className="mt-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            + Create First Group
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {groups.map((group, index) => (
            <button
              key={group.id}
              onClick={() => navigate(`/group/${group.id}/${encodeURIComponent(group.name)}`)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left ${
                index !== groups.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div
                className={`w-11 h-11 shrink-0 rounded-2xl ${group.color_code} flex items-center justify-center text-white text-xs font-black`}
              >
                {getInitials(group.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{group.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.member_count} member{Number(group.member_count) !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default GroupsSplit;
