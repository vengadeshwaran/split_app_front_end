import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, Loader2, UserMinus } from "lucide-react";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";

const GROUP_COLORS = [
  { cls: "bg-indigo-500"  },
  { cls: "bg-amber-500"   },
  { cls: "bg-emerald-500" },
  { cls: "bg-rose-500"    },
  { cls: "bg-purple-500"  },
  { cls: "bg-sky-500"     },
  { cls: "bg-teal-500"    },
  { cls: "bg-orange-500"  },
  { cls: "bg-pink-500"    },
  { cls: "bg-violet-500"  },
];

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const EditGroupPage = () => {
  const { id, name: encodedName } = useParams();
  const navigate = useNavigate();
  const currentUserId = useSelector((s) => s.user.user_id);

  const [groupName,      setGroupName]      = useState("");
  const [selectedColor,  setSelectedColor]  = useState(GROUP_COLORS[0].cls);
  const [removingUserId, setRemovingUserId] = useState(null);

  const { data: group, isLoading, refetch } = useResuableQuery({
    endpoint:   `groups/${id}`,
    withToken:  true,
    dependency: id,
  });

  useEffect(() => {
    if (group) {
      setGroupName(group.name || "");
      setSelectedColor(group.color_code || GROUP_COLORS[0].cls);
    }
  }, [group]);

  const { mutate: saveGroup, isPending: isSaving } = useReusableMutation({
    onSuccess: (data) =>
      navigate(`/group/${id}/${encodeURIComponent(data.name || groupName || encodedName || "")}`),
  });

  const { mutate: removeGroupMember, isPending: isRemoving } = useReusableMutation({
    onSuccess: (_, variables) => {
      const removedSelf = variables?.endPoint?.endsWith(`/${currentUserId}`);
      if (removedSelf) {
        navigate("/groups");
      } else {
        setRemovingUserId(null);
        refetch();
      }
    },
    onError: () => setRemovingUserId(null),
  });

  const handleSave = () => {
    if (!groupName.trim()) return;
    saveGroup({
      endPoint: `groups/${id}`,
      method:   "patch",
      json:     true,
      payload:  { name: groupName.trim(), colorCode: selectedColor },
    });
  };

  const handleRemove = (userId) => {
    setRemovingUserId(userId);
    removeGroupMember({
      endPoint: `groups/${id}/members/${userId}`,
      method:   "delete",
      json:     false,
    });
  };

  const members  = group?.members || [];
  const isDirty  = group &&
    (groupName.trim() !== group.name || selectedColor !== group.color_code);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <div className="flex-1 pb-32 p-4 md:p-6 space-y-5">

        <div>
          <h1 className="text-xl font-black text-slate-800">Edit Group</h1>
          <p className="text-xs text-slate-400 mt-0.5">Update name, color, or remove members.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading group…</span>
          </div>
        ) : (
          <>
            {/* Name + Color */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl ${selectedColor} flex items-center justify-center text-white text-lg font-black shrink-0 shadow-md`}
                >
                  {getInitials(groupName || "G")}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
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
                        selectedColor === cls
                          ? "ring-2 ring-offset-2 ring-slate-600 scale-110"
                          : "hover:scale-105"
                      }`}
                    >
                      {selectedColor === cls && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Members */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Members ({members.length})
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No members found.</p>
                ) : (
                  members.map((m, i) => {
                    const isMe          = Number(m.id) === Number(currentUserId);
                    const isBeingRemoved = removingUserId === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 px-4 py-3.5 ${
                          i !== members.length - 1 ? "border-b border-slate-100" : ""
                        }`}
                      >
                        <div
                          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-black"
                          style={{ backgroundColor: m.color_code }}
                        >
                          {getInitials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">{m.name}</p>
                          {isMe && (
                            <p className="text-[10px] text-indigo-500 font-bold mt-0.5">You</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(m.id)}
                          disabled={isRemoving}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-50 shrink-0"
                        >
                          {isBeingRemoved && isRemoving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                          {isMe ? "Leave" : "Remove"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Save Button */}
      {!isLoading && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-100 space-y-2">
          <button
            onClick={handleSave}
            disabled={!isDirty || !groupName.trim() || isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            onClick={() => navigate(`/group/${id}/${encodedName || encodeURIComponent(group?.name || "")}`)}
            className="w-full text-sm font-bold text-slate-500 py-2.5 hover:text-slate-700 transition-colors"
          >
            Go to Group Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default EditGroupPage;
