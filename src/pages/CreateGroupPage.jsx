import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Users, Search, Loader2 } from "lucide-react";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";

const GROUP_COLORS = [
  { label: "Indigo",  cls: "bg-indigo-500"  },
  { label: "Amber",   cls: "bg-amber-500"   },
  { label: "Emerald", cls: "bg-emerald-500" },
  { label: "Rose",    cls: "bg-rose-500"    },
  { label: "Purple",  cls: "bg-purple-500"  },
  { label: "Sky",     cls: "bg-sky-500"     },
  { label: "Teal",    cls: "bg-teal-500"    },
  { label: "Orange",  cls: "bg-orange-500"  },
  { label: "Pink",    cls: "bg-pink-500"    },
  { label: "Violet",  cls: "bg-violet-500"  },
];

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const CreateGroupPage = () => {
  const navigate = useNavigate();

  const [groupName, setGroupName]         = useState("");
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0].cls);
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [search, setSearch]               = useState("");
  const [apiError, setApiError]           = useState("");

  const { data: users = [], isLoading: loadingUsers } = useResuableQuery({
    endpoint:  "friends/users",
    withToken: true,
  });

  const { mutate: createGroup, isPending } = useReusableMutation({
    onSuccess: (data) => {
      navigate(`/groups/edit/${data.id}/${encodeURIComponent(data.name)}`);
    },
    onError: (err) => {
      setApiError(err?.response?.data?.error || "Failed to create group. Please try again.");
    },
  });

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const toggleMember = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const removeMember = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const selectedUsers = users.filter((u) => selectedIds.has(u.id));

  const canCreate = groupName.trim().length > 0 && selectedIds.size >= 1 && !isPending;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!canCreate) return;
    setApiError("");
    createGroup({
      endPoint: "groups",
      method:   "post",
      json:     true,
      payload: {
        name:      groupName.trim(),
        colorCode: selectedColor,
        memberIds: [...selectedIds],
      },
    });
  };

  const preview = getInitials(groupName.trim() || "G");

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <form onSubmit={handleCreate} className="flex-1 pb-28">

        <div className="p-4 md:p-6 space-y-5">

          <div>
            <h1 className="text-xl font-black text-slate-800">Create New Group</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Name your group, pick a color, then add members.
            </p>
          </div>

          {/* Group Name + Color */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${selectedColor} flex items-center justify-center text-white text-lg font-black shrink-0 shadow-md`}>
                {preview}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => { setGroupName(e.target.value); setApiError(""); }}
                  placeholder="e.g. Weekend Trip, Flat Mates…"
                  maxLength={40}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Group Color
              </p>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map(({ cls }) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedColor(cls)}
                    className={`w-8 h-8 rounded-xl ${cls} flex items-center justify-center transition-all ${
                      selectedColor === cls ? "ring-2 ring-offset-2 ring-slate-600 scale-110" : "hover:scale-105"
                    }`}
                  >
                    {selectedColor === cls && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected member chips */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Added Members ({selectedUsers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-1.5"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
                      style={{ backgroundColor: u.color_code }}
                    >
                      {getInitials(u.name)}
                    </div>
                    <span className="text-xs font-bold text-indigo-700">{u.name.split(" ")[0]}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(u.id)}
                      className="text-indigo-400 hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users list */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Add Members
              </p>
              {!loadingUsers && (
                <span className="text-[10px] font-bold text-slate-400">{users.length} users</span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading users…</span>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No users found.</p>
              ) : (
                filtered.map((user, i) => {
                  const isSelected = selectedIds.has(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleMember(user.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                        i !== filtered.length - 1 ? "border-b border-slate-100" : ""
                      } ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50 active:bg-slate-100"}`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ backgroundColor: user.color_code }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <span className={`flex-1 text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>
                        {user.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {apiError && (
            <p className="text-[11px] font-bold text-rose-500 text-center">{apiError}</p>
          )}

        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-100 space-y-2">
          {(groupName.trim() || selectedIds.size > 0) && (
            <div className="flex items-center gap-2 px-1">
              <div className={`w-5 h-5 rounded-lg ${selectedColor} flex items-center justify-center text-white text-[9px] font-black shrink-0`}>
                {preview}
              </div>
              <p className="text-xs text-slate-500 font-medium flex-1 truncate">
                {groupName.trim() || <span className="italic text-slate-400">No name yet</span>}
                {selectedIds.size > 0 && (
                  <span className="text-slate-400"> · {selectedIds.size} member{selectedIds.size !== 1 ? "s" : ""} added</span>
                )}
              </p>
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}

          <button
            type="submit"
            disabled={!canCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating…
              </>
            ) : canCreate ? (
              `Create Group · ${selectedIds.size} member${selectedIds.size !== 1 ? "s" : ""}`
            ) : (
              "Enter a name & add at least 1 member"
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateGroupPage;
