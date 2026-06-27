import { Users, LayoutDashboard, ArrowLeftRight, BadgeIndianRupee, ShieldCheck, ShieldOff } from "lucide-react";
import { useSelector } from "react-redux";
import { useResuableQuery } from "../customHooks/useDataQuery";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value ?? "—"}</p>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const cs = useSelector((s) => s.currency.symbol);

  const { data, isLoading } = useResuableQuery({
    endpoint:  "admin/overview",
    withToken: true,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <section className="p-4 md:p-6 space-y-6">

      <div>
        <h1 className="text-xl font-black text-slate-800">Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">App-wide overview — admin only</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Users}
          label="Total Users"
          value={data?.total_users}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon={LayoutDashboard}
          label="Total Groups"
          value={data?.total_groups}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Transactions"
          value={data?.total_transactions}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon={BadgeIndianRupee}
          label="Total Amount"
          value={`${cs}${Number(data?.total_amount ?? 0).toFixed(2)}`}
          color="bg-rose-100 text-rose-600"
        />
      </div>

      {/* Recent Users */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Recent Users ({data?.recent_users?.length ?? 0})
        </p>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {(data?.recent_users ?? []).map((u, i, arr) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${i !== arr.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 bg-indigo-500"
              >
                {getInitials(u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wide ${
                u.is_admin
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {u.is_admin
                  ? <><ShieldCheck className="w-3 h-3" /> Admin</>
                  : <><ShieldOff className="w-3 h-3" /> User</>
                }
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default AdminDashboardPage;
