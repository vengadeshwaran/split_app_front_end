import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowDownLeft, CheckCircle } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton";
import { useReusableMutation } from "../customHooks/useDataQuery";

const RequestMoneyPage = () => {
  const navigate    = useNavigate();
  const { id, name } = useParams();
  const cs          = useSelector((s) => s.currency.symbol);
  const friendName  = decodeURIComponent(name);

  const [form,     setForm]    = useState({ desc: "", amount: "" });
  const [apiError, setApiError] = useState("");
  const [done,     setDone]    = useState(false);

  const { mutate: submitRequest, isPending } = useReusableMutation({
    onSuccess: () => {
      setDone(true);
      setTimeout(() => navigate(`/transaction/${id}/${name}`), 1200);
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err?.message || "Request failed. Please try again.";
      setApiError(msg);
    },
  });

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value !== "" && !/^\d{0,6}(\.\d{0,2})?$/.test(value)) return;
    if (Number(value) > 100000) return;
    setForm((prev) => ({ ...prev, amount: value }));
    setApiError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setApiError("");
    submitRequest({
      endPoint: "transactions",
      method:   "post",
      json:     true,
      payload: {
        toUserId:    Number(id),
        type:        "request",
        description: form.desc,
        amount:      Number(form.amount),
        currency:    cs,
      },
    });
  };

  const isValid = form.amount && Number(form.amount) > 0 && !/\.\d{3,}/.test(form.amount) && form.desc.trim();

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-indigo-600" />
        </div>
        <p className="text-xl font-black text-slate-800">Request Sent!</p>
        <p className="text-sm text-slate-400 text-center">
          Requested {cs}{Number(form.amount).toFixed(2)} from <strong>{friendName}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <div className="flex-1 pt-6 pb-32 space-y-5 w-full">

        {/* From card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center text-white text-sm font-black shrink-0">
            {friendName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Requesting from</p>
            <p className="text-sm font-black text-slate-800">{friendName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Amount */}
          <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-colors duration-200 ${
            form.amount && Number(form.amount) > 0 ? "border-indigo-300" : "border-slate-200"
          }`}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-400">{cs}</span>
              <input
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="flex-1 text-2xl font-black text-slate-800 outline-none bg-transparent placeholder:text-slate-300"
              />
              {form.amount && Number(form.amount) > 0 && (
                <span className="text-indigo-500 text-sm font-black">✓</span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Reason
            </label>
            <input
              type="text"
              value={form.desc}
              onChange={(e) => { setForm((p) => ({ ...p, desc: e.target.value })); setApiError(""); }}
              placeholder="e.g. For Dinner Split last night"
              required
              maxLength={100}
              className="w-full text-sm font-medium text-slate-800 outline-none bg-transparent placeholder:text-slate-300"
            />
            {form.desc && (
              <p className="text-[10px] text-slate-400 mt-1 text-right">{form.desc.length}/100</p>
            )}
          </div>

          {/* Preview */}
          {isValid && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3.5 space-y-2 shadow-sm">
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide bg-indigo-100 text-indigo-700">
                REQUEST SENT
              </span>
              <p className="text-sm font-bold text-slate-800">You requested money</p>
              <p className="text-xs text-slate-500">{form.desc}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">Requested Total</span>
                <span className="text-base font-black text-slate-800">{cs}{Number(form.amount).toFixed(2)}</span>
              </div>
            </div>
          )}

          {apiError && (
            <p className="text-[11px] font-bold text-rose-500 text-center">{apiError}</p>
          )}

          {/* Submit */}
          <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-100">
            <PrimaryButton type="submit" disabled={!isValid || isPending}>
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <ArrowDownLeft className="w-4 h-4" />
                  Send Request
                </>
              )}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestMoneyPage;
