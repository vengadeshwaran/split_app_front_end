import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Loader2, MessageSquare, Clock, CheckCircle2, Check, XCircle, ArrowDownLeft } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const MemberBalanceSection = ({
  title, titleColor, members, selectedKey, onSelectKey, keyPrefix,
  cs, isSettling, expandLabel, expandDesc, onConfirm, amountColor, icon,
}) => (
  <div>
    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${titleColor}`}>
      {title}
    </p>
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {members.map((m, i) => {
        const key      = `${keyPrefix}_${m.user_id}`;
        const expanded = selectedKey === key;
        const isLast   = i === members.length - 1;

        return (
          <div key={m.user_id}>
            <div
              onClick={() => onSelectKey((prev) => (prev === key ? null : key))}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                expanded ? "bg-indigo-50" : "hover:bg-slate-50"
              } ${!isLast || expanded ? "border-b border-slate-100" : ""}`}
            >
              <div
                className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-black"
                style={{ backgroundColor: m.color_code }}
              >
                {getInitials(m.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{m.name}</p>
                {m.pending <= 0 ? (
                  <p className="text-xs text-emerald-500 font-medium mt-0.5">Settled</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cs}{m.total_settled.toFixed(2)} paid of {cs}{m.total_owed.toFixed(2)}
                  </p>
                )}
              </div>
              {m.pending > 0 ? (
                <>
                  <p className={`text-sm font-black ${amountColor}`}>{cs}{m.pending.toFixed(2)}</p>
                  {icon}
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-emerald-500">{cs}0.00</p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />
                </>
              )}
            </div>

            {expanded && m.pending > 0 && (
              <div className={`px-4 py-3 bg-indigo-50 flex items-center justify-between gap-3 ${!isLast ? "border-b border-slate-100" : ""}`}>
                <p className="text-xs text-slate-600 font-medium flex-1">{expandDesc(m)}</p>
                <button
                  onClick={() => onConfirm(m)}
                  disabled={isSettling}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm disabled:opacity-60 shrink-0"
                >
                  {isSettling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {isSettling ? "Saving…" : expandLabel(m)}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const GroupTransactionPage = () => {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const cs = useSelector((s) => s.currency.symbol);
  const currentUserId = useSelector((s) => s.user.user_id);
  const groupName = decodeURIComponent(name);
  const [activeTab, setActiveTab]   = useState("chat");
  const [selectedKey, setSelectedKey] = useState(null);
  const [reqError, setReqError]     = useState("");
  const bottomRef = useRef(null);

  /* ── Chat ── */
  const { data: messages = [], isLoading: loadingMessages } = useResuableQuery({
    endpoint:  `groups/${id}/messages`,
    withToken: true,
    dependency: id,
  });

  useEffect(() => {
    if (!loadingMessages) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [loadingMessages, messages]);

  /* ── Pending money requests from group members (to me) ── */
  const {
    data: pendingRequests = [],
    refetch: refetchRequests,
  } = useResuableQuery({
    endpoint:   `groups/${id}/requests`,
    withToken:  true,
    dependency: id,
  });

  const { mutate: acceptReq, isPending: isAcceptingReq } = useReusableMutation({
    onSuccess: () => { refetchRequests(); setReqError(""); },
    onError: (err) => {
      setReqError(err?.response?.data?.error || "Failed to accept. Please try again.");
    },
  });

  const { mutate: declineReq, isPending: isDecliningReq } = useReusableMutation({
    onSuccess: () => { refetchRequests(); setReqError(""); },
    onError: (err) => {
      setReqError(err?.response?.data?.error || "Failed to decline. Please try again.");
    },
  });

  const isReqActioning = isAcceptingReq || isDecliningReq;

  const handleGroupAccept = (txId) => {
    setReqError("");
    acceptReq({ endPoint: `transactions/${txId}/accept`, method: "patch", json: false });
  };

  const handleGroupDecline = (txId) => {
    setReqError("");
    declineReq({ endPoint: `transactions/${txId}/decline`, method: "patch", json: false });
  };

  /* ── My pairwise balances ── */
  const {
    data: myBalances = { i_owe: [], owed_to_me: [] },
    isLoading: loadingBalances,
    refetch: refetchBalances,
  } = useResuableQuery({
    endpoint:   `groups/${id}/my-balances`,
    withToken:  true,
    dependency: id,
  });

  const { mutate: settlePairwise, isPending: isSettling } = useReusableMutation({
    onSuccess: () => {
      setSelectedKey(null);
      refetchBalances();
    },
  });

  const handleSettle = (settlerUserId, payerUserId) => {
    settlePairwise({
      endPoint: `groups/${id}/settle-pairwise`,
      method:   "post",
      json:     true,
      payload:  { settlerUserId, payerUserId },
    });
  };

  /* ── Derived ── */
  const iOwe      = myBalances.i_owe      || [];
  const owedToMe  = myBalances.owed_to_me || [];
  const totalIOwe    = iOwe.reduce((s, b) => s + b.pending, 0);
  const totalOwedMe  = owedToMe.reduce((s, b) => s + b.pending, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent md:px-6">

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4">
        {["chat", "expenses"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── EXPENSES TAB ── */}
      {activeTab === "expenses" && (
        <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">

          {/* Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex divide-x divide-slate-100">
            <div className="flex-1 p-4 text-center">
              <p className={`text-xl font-black ${totalIOwe > 0 ? "text-rose-600" : "text-slate-400"}`}>
                {cs}{loadingBalances ? "—" : totalIOwe.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">You owe</p>
            </div>
            <div className="flex-1 p-4 text-center">
              <p className={`text-xl font-black ${totalOwedMe > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                {cs}{loadingBalances ? "—" : totalOwedMe.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Owed to you</p>
            </div>
          </div>

          {loadingBalances ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading balances…</span>
            </div>
          ) : (
            <>
              {/* YOU OWE */}
              {iOwe.length > 0 && (
                <MemberBalanceSection
                  title="You Owe"
                  titleColor="text-rose-500"
                  members={iOwe}
                  selectedKey={selectedKey}
                  onSelectKey={setSelectedKey}
                  keyPrefix="owe"
                  cs={cs}
                  isSettling={isSettling}
                  expandLabel={(m) => `Mark as Paid to ${m.name}`}
                  expandDesc={(m) => `You owe ${m.name} ${cs}${m.pending.toFixed(2)}`}
                  onConfirm={(m) => handleSettle(currentUserId, m.user_id)}
                  amountColor="text-rose-600"
                  icon={<Clock className="w-4 h-4 text-rose-400 shrink-0 ml-1" />}
                />
              )}

              {/* OWED TO YOU */}
              {owedToMe.length > 0 && (
                <MemberBalanceSection
                  title="Owed to You"
                  titleColor="text-emerald-600"
                  members={owedToMe}
                  selectedKey={selectedKey}
                  onSelectKey={setSelectedKey}
                  keyPrefix="recv"
                  cs={cs}
                  isSettling={isSettling}
                  expandLabel={(m) => `${m.name} Paid Me`}
                  expandDesc={(m) => `${m.name} owes you ${cs}${m.pending.toFixed(2)}`}
                  onConfirm={(m) => handleSettle(m.user_id, currentUserId)}
                  amountColor="text-emerald-600"
                  icon={<Clock className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                />
              )}

              {iOwe.length === 0 && owedToMe.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <p className="text-sm font-bold text-slate-600">All settled!</p>
                  <p className="text-xs text-slate-400">No pending dues for you in this group.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="flex-1 overflow-y-auto py-4 pb-24 space-y-3 px-4">

          {/* Pending money requests from group members */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                Pending Requests
              </p>
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white border border-rose-200 rounded-2xl px-4 py-3.5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide bg-rose-100 text-rose-700 flex items-center gap-1">
                      <ArrowDownLeft className="w-2.5 h-2.5" /> MONEY REQUESTED
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: req.from_color }}
                    >
                      {req.from_name?.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.from_name} requested money</p>
                      {req.description && (
                        <p className="text-xs text-slate-500">{req.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Amount</span>
                    <span className="text-base font-black text-rose-700">
                      {req.currency} {Number(req.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleGroupDecline(req.id)}
                      disabled={isReqActioning}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-extrabold py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {isDecliningReq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGroupAccept(req.id)}
                      disabled={isReqActioning}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {isAcceptingReq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Accept
                    </button>
                  </div>
                </div>
              ))}

              {reqError && (
                <div
                  onClick={() => setReqError("")}
                  className="bg-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  {reqError}
                </div>
              )}
            </div>
          )}

          {loadingMessages ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading messages…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-indigo-300" />
              </div>
              <p className="text-sm font-bold text-slate-500">No expenses yet</p>
              <p className="text-xs text-slate-400">Split your first expense with the group.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe        = Number(msg.from_user_id) === Number(currentUserId);
              const isExpense   = msg.type === "expense";
              const hasSplits   = msg.has_splits;
              const myShare     = msg.my_share != null ? Number(msg.my_share) : null;
              const isExcluded  = isExpense && !isMe && hasSplits && myShare === null;
              const badgeColor  = isExpense ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
              const badgeLabel  = isExpense ? "EXPENSE LOGGED" : "PAYMENT COMPLETED";
              const title = isMe
                ? isExpense ? "You added an expense" : "You sent a payment"
                : isExpense
                  ? `${msg.from_name} added expense`
                  : `${msg.from_name} sent payment`;

              // Determine amount label + value for this user
              let amountLabel = "Total";
              let amountValue = Number(msg.amount);
              if (isExpense && !isMe && !isExcluded) {
                // Included non-payer: show their share
                const shareAmt = hasSplits ? myShare : Number(msg.amount);
                amountLabel = "Your share";
                amountValue = shareAmt;
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] flex flex-col gap-1">
                    {!isMe && (
                      <p className="text-[10px] font-bold text-slate-400 px-1">{msg.from_name}</p>
                    )}
                    <div
                      onClick={() => isMe && isExpense && navigate(`/expense-detail/${id}/${name}/${msg.id}`)}
                      className={`rounded-2xl px-4 py-3.5 space-y-2 shadow-sm transition-transform ${
                        isMe && isExpense
                          ? "bg-emerald-50 border border-emerald-200 cursor-pointer active:scale-[0.98]"
                          : isExcluded
                          ? "bg-slate-50 border border-slate-200 opacity-70"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{title}</p>
                      {msg.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">{msg.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        {isExcluded ? (
                          <span className="text-xs font-bold text-slate-400 italic">Not included in this split</span>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-slate-500">{amountLabel}</span>
                            <span className={`text-base font-black tracking-wide ${
                              amountLabel === "Your share" ? "text-rose-600" : "text-slate-800"
                            }`}>
                              {cs}{(amountValue ?? 0).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-100">
        <PrimaryButton onClick={() => navigate(`/group-message/${id}/${name}`)}>
          <Plus className="w-4 h-4" />
          {activeTab === "chat" ? "Add Expense" : "Split Expense"}
        </PrimaryButton>
      </div>

    </div>
  );
};

export default GroupTransactionPage;
