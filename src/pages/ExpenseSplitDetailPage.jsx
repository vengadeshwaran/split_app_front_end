import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, Clock, Tag, User, Check, Loader2 } from "lucide-react";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const ExpenseSplitDetailPage = () => {
  const { groupId, expenseId } = useParams();
  const cs = useSelector((s) => s.currency.symbol);
  const [selectedId, setSelectedId] = useState(null);

  const { data: msg, isLoading, refetch } = useResuableQuery({
    endpoint:   `groups/${groupId}/messages/${expenseId}`,
    withToken:  true,
    dependency: expenseId,
  });

  const { mutate: settle, isPending: isSettling } = useReusableMutation({
    onSuccess: () => {
      setSelectedId(null);
      refetch();
    },
  });

  const handleMarkComplete = (memberId) => {
    settle({
      endPoint: `groups/${groupId}/messages/${expenseId}/settle`,
      method:   "post",
      json:     true,
      payload:  { userId: memberId },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading expense…</span>
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400 text-sm">Expense not found.</p>
      </div>
    );
  }

  const total   = Number(msg.amount);
  const members = msg.members || [];

  const splits = members.map((m) => ({
    id:       m.id,
    name:     m.name,
    initials: getInitials(m.name),
    color:    m.color_code,
    share:    m.amount ?? 0,
    paid:     m.settled,
    is_payer: m.is_payer ?? false,
  }));

  const paid       = splits.filter((s) => s.paid);
  const pending    = splits.filter((s) => !s.paid);
  const paidSum    = paid.reduce((s, m) => s + m.share, 0);
  const pendingSum = pending.reduce((s, m) => s + m.share, 0);

  const nonPayerSplits  = splits.filter((s) => !s.is_payer);
  const allEqual        = nonPayerSplits.length > 0 &&
    nonPayerSplits.every((s) => Math.abs(s.share - nonPayerSplits[0].share) < 0.01);
  const splitTypeLabel  = allEqual ? "Equal" : "Custom";

  return (
    <div className="flex flex-col min-h-screen bg-transparent pb-8">
      <div className="px-4 pt-5 space-y-4">

        {/* Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-base font-black text-slate-800 leading-tight">{msg.description || "Expense"}</p>
              <p className="text-xs text-slate-400 mt-0.5">Expense breakdown</p>
            </div>
            <span className="text-2xl font-black text-slate-800 shrink-0">{cs}{total.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Paid By</p>
                <p className="text-xs font-black text-slate-700">{msg.from_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Split</p>
                <p className="text-xs font-black text-slate-700">{splitTypeLabel} · {splits.length} members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-600">Collected {cs}{paidSum.toFixed(2)}</span>
            <span className="text-rose-500">Pending {cs}{pendingSum.toFixed(2)}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (paidSum / total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            {paid.length} of {splits.length} members settled
          </p>
        </div>

        {/* Pending Members */}
        {pending.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Pending ({pending.length})
            </p>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {pending.map((m, i) => (
                <div key={m.id}>
                  <div
                    onClick={() => setSelectedId((prev) => (prev === m.id ? null : m.id))}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      selectedId === m.id ? "bg-indigo-50" : "hover:bg-slate-50"
                    } ${i !== pending.length - 1 || selectedId === m.id ? "border-b border-slate-100" : ""}`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <span className="flex-1 text-sm font-bold text-slate-700">{m.name}</span>
                    <span className="text-sm font-black text-slate-800">{cs}{m.share.toFixed(2)}</span>
                    <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                  </div>

                  {selectedId === m.id && (
                    <div className={`px-4 py-3 bg-indigo-50 flex items-center justify-between ${
                      i !== pending.length - 1 ? "border-b border-slate-100" : ""
                    }`}>
                      <p className="text-xs text-slate-500 font-medium">
                        Mark <span className="font-black text-slate-700">{m.name}</span> as paid?
                      </p>
                      <button
                        onClick={() => handleMarkComplete(m.id)}
                        disabled={isSettling}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-60"
                      >
                        {isSettling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        {isSettling ? "Saving…" : "Mark as Paid"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settled Members */}
        {paid.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Settled ({paid.length})
            </p>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {paid.map((m, i) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i !== paid.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials}
                  </div>
                  <span className="flex-1 text-sm font-bold text-slate-700">{m.name}</span>
                  <span className="text-sm font-black text-slate-800">{cs}{m.share.toFixed(2)}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExpenseSplitDetailPage;
