import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FileText, Percent, Hash, DollarSign, Loader2, CheckCircle } from "lucide-react";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";

const categories = ["Food", "Transport", "Shopping", "Entertainment", "Utilities", "Others"];

const splitTypes = [
  { key: "equal",   label: "Equal",   Icon: FileText  },
  { key: "percent", label: "Percent", Icon: Percent   },
  { key: "shares",  label: "Shares",  Icon: Hash      },
  { key: "custom",  label: "Custom",  Icon: DollarSign },
];

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const GroupSpliPage = () => {
  const navigate    = useNavigate();
  const { id, name } = useParams();
  const cs          = useSelector((s) => s.currency.symbol);
  const groupName   = decodeURIComponent(name);

  const [title, setTitle]         = useState("");
  const [amount, setAmount]       = useState("");
  const [category, setCategory]   = useState("Food");
  const [splitType, setSplitType] = useState("equal");
  const [notes, setNotes]         = useState("");
  const [done, setDone]           = useState(false);
  const [apiError, setApiError]   = useState("");

  const { data: group, isLoading: loadingGroup } = useResuableQuery({
    endpoint:  `groups/${id}`,
    withToken: true,
    dependency: id,
  });

  const members = group?.members || [];

  const [percents, setPercents] = useState({});
  const [shares, setShares]     = useState({});
  const [custom, setCustom]     = useState({});

  const total = parseFloat(amount) || 0;

  const memberAmounts = useMemo(() => {
    if (members.length === 0) return {};
    if (splitType === "equal") {
      const each = total / members.length;
      return Object.fromEntries(members.map((m) => [m.id, each]));
    }
    if (splitType === "percent") {
      return Object.fromEntries(
        members.map((m) => [m.id, (total * (parseFloat(percents[m.id] ?? 0) || 0)) / 100])
      );
    }
    if (splitType === "shares") {
      const totalShares = members.reduce((s, m) => s + (parseFloat(shares[m.id] ?? 1) || 0), 0);
      return Object.fromEntries(
        members.map((m) => [
          m.id,
          totalShares ? (total * (parseFloat(shares[m.id] ?? 1) || 0)) / totalShares : 0,
        ])
      );
    }
    return Object.fromEntries(members.map((m) => [m.id, parseFloat(custom[m.id] ?? 0) || 0]));
  }, [splitType, total, percents, shares, custom, members]);

  const percentSum = members.reduce((s, m) => s + (parseFloat(percents[m.id] ?? 0) || 0), 0);
  const customSum  = members.reduce((s, m) => s + (parseFloat(custom[m.id]  ?? 0) || 0), 0);

  const { mutate: submitExpense, isPending } = useReusableMutation({
    onSuccess: () => {
      setDone(true);
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      setApiError(err?.response?.data?.error || "Failed to add expense. Please try again.");
    },
  });

  const isValid =
    title.trim() &&
    total > 0 &&
    (splitType !== "percent" || Math.abs(percentSum - 100) < 0.01) &&
    (splitType !== "custom"  || Math.abs(customSum  - total) < 0.01) &&
    !isPending;

  const handleAmountChange = (e) => {
    const v = e.target.value;
    if (v !== "" && !/^\d{0,8}(\.\d{0,2})?$/.test(v)) return;
    setAmount(v);
  };

  const handleMemberVal = (setter) => (memberId, val) => {
    if (val !== "" && !/^\d{0,8}(\.\d{0,2})?$/.test(val)) return;
    setter((prev) => ({ ...prev, [memberId]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setApiError("");
    submitExpense({
      endPoint: `groups/${id}/messages`,
      method:   "post",
      json:     true,
      payload: {
        type:        "expense",
        description: notes ? `${title} — ${notes}` : title,
        amount:      parseFloat(amount),
        currency:    "AED",
      },
    });
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-amber-600" />
        </div>
        <p className="text-xl font-black text-slate-800">Expense Added!</p>
        <p className="text-sm text-slate-400 text-center">
          {cs}{Number(amount).toFixed(2)} expense logged to <strong>{groupName}</strong>
        </p>
      </div>
    );
  }

  const inputCls  = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-colors";
  const selectCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-colors appearance-none";

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <form onSubmit={handleSubmit} className="flex-1 pb-28">

        <div className="px-4 pt-5 space-y-4">

          {/* Title + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Expense Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setApiError(""); }}
                placeholder="e.g. Carrefour groceries"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Total Amount ({cs})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Category
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Split Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {splitTypes.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSplitType(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                    splitType === key
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Per-member breakdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              {splitType === "equal"   && "Amount Per Person"}
              {splitType === "percent" && `Specify Percent Per Person ${Math.abs(percentSum - 100) > 0.01 ? `· ${percentSum.toFixed(0)}% / 100%` : "· ✓"}`}
              {splitType === "shares"  && "Specify Shares Per Person"}
              {splitType === "custom"  && `Specify Custom Amount ${total > 0 ? `· ${cs}${customSum.toFixed(2)} / ${cs}${total.toFixed(2)}` : ""}`}
            </label>

            {loadingGroup ? (
              <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading members…</span>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {members.map((m, i) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i !== members.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: m.color_code }}
                    >
                      {getInitials(m.name)}
                    </div>
                    <span className="flex-1 text-sm font-bold text-slate-700">{m.name}</span>

                    {splitType === "equal" && (
                      <span className="text-sm font-black text-slate-800">
                        {cs}{total > 0 ? (memberAmounts[m.id] || 0).toFixed(2) : "0.00"}
                      </span>
                    )}

                    {splitType === "percent" && (
                      <div className="flex items-center gap-1">
                        <input
                          type="text" inputMode="decimal"
                          value={percents[m.id] ?? "0"}
                          onChange={(e) => handleMemberVal(setPercents)(m.id, e.target.value)}
                          className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right outline-none focus:border-indigo-400"
                        />
                        <span className="text-xs text-slate-400 font-bold">%</span>
                      </div>
                    )}

                    {splitType === "shares" && (
                      <div className="flex items-center gap-1">
                        <input
                          type="text" inputMode="decimal"
                          value={shares[m.id] ?? "1"}
                          onChange={(e) => handleMemberVal(setShares)(m.id, e.target.value)}
                          className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right outline-none focus:border-indigo-400"
                        />
                        <span className="text-xs text-slate-400 font-bold">sh</span>
                      </div>
                    )}

                    {splitType === "custom" && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-bold">{cs}</span>
                        <input
                          type="text" inputMode="decimal"
                          value={custom[m.id] ?? "0"}
                          onChange={(e) => handleMemberVal(setCustom)(m.id, e.target.value)}
                          className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right outline-none focus:border-indigo-400"
                        />
                      </div>
                    )}

                    {splitType !== "equal" && (
                      <span className="text-xs text-slate-400 w-14 text-right">
                        {cs}{(memberAmounts[m.id] || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. receipt #0981"
              rows={3}
              maxLength={200}
              className={`${inputCls} resize-none`}
            />
          </div>

          {apiError && (
            <p className="text-[11px] font-bold text-rose-500 text-center">{apiError}</p>
          )}

        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-100">
          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Confirm & Split Bill"
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default GroupSpliPage;
