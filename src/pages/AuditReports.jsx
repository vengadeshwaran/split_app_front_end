import { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowUpRight, ArrowDownLeft, Receipt, Users, Loader2 } from "lucide-react";
import { useResuableQuery } from "../customHooks/useDataQuery";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const formatGroupDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDisplayProps = (item) => {
  const { source, type, direction, other_name, group_name, description } = item;

  let title;
  if (source === "group") {
    title = direction === "sent"
      ? `You added expense · ${group_name}`
      : `${other_name} added expense · ${group_name}`;
  } else if (type === "request") {
    title = direction === "sent"
      ? `You requested from ${other_name}`
      : `${other_name} requested from you`;
  } else {
    title = direction === "sent"
      ? `You logged expense with ${other_name}`
      : `${other_name} logged expense with you`;
  }

  let badge, badgeBg;
  if (type === "request") {
    badge   = direction === "sent" ? "REQUEST SENT" : "REQUEST RECEIVED";
    badgeBg = "bg-indigo-100 text-indigo-600";
  } else if (source === "group") {
    badge   = "GROUP EXPENSE";
    badgeBg = "bg-indigo-100 text-indigo-600";
  } else {
    badge   = "EXPENSE LOGGED";
    badgeBg = "bg-amber-100 text-amber-700";
  }

  let icon, iconBg, iconColor;
  if (source === "group") {
    icon = Users; iconBg = "bg-indigo-100"; iconColor = "text-indigo-600";
  } else if (type === "request") {
    icon = direction === "sent" ? ArrowUpRight : ArrowDownLeft;
    iconBg = "bg-indigo-100"; iconColor = "text-indigo-600";
  } else {
    icon = Receipt; iconBg = "bg-amber-100"; iconColor = "text-amber-600";
  }

  return { title, badge, badgeBg, icon, iconBg, iconColor, desc: description || "" };
};

const filters = ["All", "Sent", "Received", "Expenses"];

const filterMap = {
  All:      () => true,
  Sent:     (t) => t.direction === "sent",
  Received: (t) => t.direction === "received",
  Expenses: (t) => t.type === "expense",
};

const AuditReports = () => {
  const cs = useSelector((s) => s.currency.symbol);
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: logs = [], isLoading } = useResuableQuery({
    endpoint:  "transactions/audit",
    withToken: true,
  });

  const filtered = logs.filter(filterMap[activeFilter]);

  const totalPaid      = logs.filter((t) => t.direction === "sent" && t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalRequested = logs.filter((t) => t.direction === "sent" && t.type === "request").reduce((s, t) => s + t.amount, 0);

  const grouped = filtered.reduce((acc, tx) => {
    const key = formatGroupDate(tx.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <section className="p-4 md:p-6 space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
          <p className="text-xl font-black text-rose-600">
            {cs}{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {logs.filter((t) => t.direction === "sent" && t.type === "expense").length} expenses
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Requested</p>
          <p className="text-xl font-black text-emerald-600">
            {cs}{totalRequested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {logs.filter((t) => t.direction === "sent" && t.type === "request").length} requests
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === f
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading activity…</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Receipt className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-500">No activity found</p>
          <p className="text-xs text-slate-400">Try a different filter.</p>
        </div>
      )}

      {/* Transaction List */}
      {!isLoading && (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{date}</p>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {txns.map((tx, i) => {
                  const { title, badge, badgeBg, icon: Icon, iconBg, iconColor, desc } = getDisplayProps(tx);
                  const isPositive = tx.direction === "received";

                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${i !== txns.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ backgroundColor: tx.other_color || "#94a3b8" }}
                      >
                        {getInitials(tx.other_name)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${badgeBg}`}>
                            {badge}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-tight truncate">{title}</p>
                        {desc && <p className="text-xs text-slate-400 mt-0.5 truncate">{desc}</p>}
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-black ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? "+" : "-"}{cs}{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                        <div className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center ml-auto mt-1`}>
                          <Icon className={`w-3 h-3 ${iconColor}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
};

export default AuditReports;
