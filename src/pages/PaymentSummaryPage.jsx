import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowUpRight, ArrowDownLeft, CheckCircle2, Circle,
  CheckCheck, Wallet, TrendingUp, TrendingDown, Minus,
} from "lucide-react";

const CATEGORY_COLORS = {
  Food:          "bg-amber-100 text-amber-700",
  Transport:     "bg-sky-100 text-sky-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Shopping:      "bg-pink-100 text-pink-700",
  Utilities:     "bg-slate-100 text-slate-600",
  Mixed:         "bg-indigo-100 text-indigo-700",
};

const INITIAL_PAYMENTS = [
  { id: 1, title: "Dinner at Dubai Marina", date: "Jun 10", youOwe: 116.67, theyOwe: 0,   paid: false, category: "Food"          },
  { id: 2, title: "Cab to Mall",            date: "Jun 11", youOwe: 0,      theyOwe: 60,  paid: false, category: "Transport"      },
  { id: 3, title: "Movie Tickets",          date: "Jun 12", youOwe: 250,    theyOwe: 0,   paid: false, category: "Entertainment"  },
  { id: 4, title: "Grocery Run",            date: "Jun 13", youOwe: 0,      theyOwe: 140, paid: true,  category: "Shopping"       },
  { id: 5, title: "Electricity Bill",       date: "Jun 15", youOwe: 183.33, theyOwe: 0,   paid: false, category: "Utilities"      },
  { id: 6, title: "Dinner Leftovers Split", date: "Jun 16", youOwe: 0,      theyOwe: 75,  paid: false, category: "Food"           },
];

const PaymentSummaryPage = () => {
  const { name } = useParams();
  const friendName = decodeURIComponent(name);
  const cs = useSelector((s) => s.currency.symbol);

  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  const togglePaid = (id) =>
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    );

  const markAllSettled = () =>
    setPayments((prev) => prev.map((p) => ({ ...p, paid: true })));

  const { totalYouOwe, totalTheyOwe, netYouOwe, netTheyOwe, allSettled } =
    useMemo(() => {
      const pending = payments.filter((p) => !p.paid);
      const tyo  = pending.reduce((s, p) => s + p.youOwe, 0);
      const ttyo = pending.reduce((s, p) => s + p.theyOwe, 0);
      const diff = tyo - ttyo;
      return {
        totalYouOwe:  tyo,
        totalTheyOwe: ttyo,
        netYouOwe:    diff > 0 ? diff : 0,
        netTheyOwe:   diff < 0 ? Math.abs(diff) : 0,
        allSettled:   pending.length === 0,
      };
    }, [payments]);

  const paidCount   = payments.filter((p) => p.paid).length;
  const pendingList = payments.filter((p) => !p.paid);
  const paidList    = payments.filter((p) => p.paid);

  return (
    <section className="p-4 md:p-6 space-y-4 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800">Payment Summary</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          All dues between you and <span className="font-bold text-slate-600">{friendName}</span>
        </p>
      </div>

      {/* ── Summary Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* You Owe / They Owe */}
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div className="p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-rose-500">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">You Owe</span>
            </div>
            <p className="text-2xl font-black text-rose-600">
              {cs}{totalYouOwe.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400">to {friendName}</p>
          </div>

          <div className="p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-500">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Owed to You</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              {cs}{totalTheyOwe.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400">from {friendName}</p>
          </div>
        </div>

        {/* Net Balance */}
        <div className={`px-5 py-4 border-t border-slate-100 flex items-center justify-between ${
          allSettled
            ? "bg-emerald-50"
            : netYouOwe > 0
            ? "bg-rose-50"
            : netTheyOwe > 0
            ? "bg-emerald-50"
            : "bg-slate-50"
        }`}>
          <div className="flex items-center gap-2">
            {allSettled ? (
              <CheckCheck className="w-4 h-4 text-emerald-600" />
            ) : netYouOwe > 0 ? (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            ) : netTheyOwe > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-xs font-bold text-slate-600">
              {allSettled
                ? "All settled — no pending dues!"
                : netYouOwe > 0
                ? `Net: You owe ${friendName}`
                : netTheyOwe > 0
                ? `Net: ${friendName} owes you`
                : "Net: You're even"}
            </span>
          </div>
          {!allSettled && (netYouOwe > 0 || netTheyOwe > 0) && (
            <span className={`text-base font-black ${netYouOwe > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {cs}{(netYouOwe || netTheyOwe).toFixed(2)}
            </span>
          )}
        </div>

        {/* Mark All Settled */}
        {!allSettled && (
          <div className="px-5 py-3 border-t border-slate-100">
            <button
              type="button"
              onClick={markAllSettled}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Settled
            </button>
          </div>
        )}
      </div>

      {/* Progress pill */}
      {payments.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(paidCount / payments.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {paidCount}/{payments.length} settled
          </span>
        </div>
      )}

      {/* ── Pending Payments ── */}
      {pendingList.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pending ({pendingList.length})
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {pendingList.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-4 ${
                  i !== pendingList.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                {/* Category badge + Title */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[p.category] ?? "bg-slate-100 text-slate-500"}`}>
                      {p.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{p.date}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{p.title}</p>
                  <div className="flex items-center gap-1">
                    {p.youOwe > 0 ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 text-rose-500" />
                        <span className="text-xs font-bold text-rose-600">
                          You owe {cs}{p.youOwe.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">
                          {friendName} owes {cs}{p.theyOwe.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mark as Paid */}
                <button
                  type="button"
                  onClick={() => togglePaid(p.id)}
                  className="shrink-0 flex flex-col items-center gap-1 group"
                >
                  <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors whitespace-nowrap">
                    Mark paid
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Paid / Settled ── */}
      {paidList.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Settled ({paidList.length})
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {paidList.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-4 opacity-60 ${
                  i !== paidList.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[p.category] ?? "bg-slate-100 text-slate-500"}`}>
                      {p.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{p.date}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 line-through leading-tight">{p.title}</p>
                  <span className="text-xs font-bold text-slate-400">
                    {p.youOwe > 0
                      ? `${cs}${p.youOwe.toFixed(2)} paid`
                      : `${cs}${p.theyOwe.toFixed(2)} received`}
                  </span>
                </div>

                {/* Undo paid */}
                <button
                  type="button"
                  onClick={() => togglePaid(p.id)}
                  className="shrink-0 flex flex-col items-center gap-1 group"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 group-hover:text-slate-400 transition-colors" />
                  <span className="text-[9px] font-bold text-emerald-600 group-hover:text-slate-400 transition-colors">
                    Paid
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All settled empty state */}
      {allSettled && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-base font-black text-slate-800">All Settled!</p>
          <p className="text-xs text-slate-400">
            You and {friendName} have no pending dues.
          </p>
        </div>
      )}

    </section>
  );
};

export default PaymentSummaryPage;
