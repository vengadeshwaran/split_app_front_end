import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Check, BadgeIndianRupee, DollarSign, Euro, PoundSterling, Banknote, Loader2 } from "lucide-react";
import { CURRENCY_LIST } from "../constants/currencies";
import { setCurrency } from "../redux/slice/currencySlice";
import { useReusableMutation } from "../customHooks/useDataQuery";

const CURRENCY_META = [
  {
    name: "Indian Rupee (₹)",
    region: "India",
    Icon: BadgeIndianRupee,
    preview: [116.67, 1200, 87.50],
  },
  {
    name: "UAE Dirham (AED)",
    region: "United Arab Emirates",
    Icon: Banknote,
    preview: [5.12, 52.80, 3.85],
  },
  {
    name: "US Dollar (USD)",
    region: "United States",
    Icon: DollarSign,
    preview: [1.40, 14.40, 1.05],
  },
  {
    name: "Euro (EUR)",
    region: "European Union",
    Icon: Euro,
    preview: [1.29, 13.25, 0.97],
  },
  {
    name: "British Pound (GBP)",
    region: "United Kingdom",
    Icon: PoundSterling,
    preview: [1.10, 11.32, 0.83],
  },
];

const CurrencySettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const savedName   = useSelector((s) => s.currency.name);
  const savedSymbol = useSelector((s) => s.currency.symbol);

  const [selected, setSelected] = useState(savedName);

  const selectedMeta   = CURRENCY_META.find((c) => c.name === selected);
  const selectedSymbol = CURRENCY_LIST.find((c) => c.name === selected)?.symbol ?? "₹";
  const isDirty        = selected !== savedName;

  const { mutate: saveCurrency, isPending: isSaving } = useReusableMutation({
    onSuccess: () => {
      dispatch(setCurrency({ name: selected, symbol: selectedSymbol }));
      navigate(-1);
    },
    onError: () => {},
  });

  const handleApply = () => {
    saveCurrency({
      endPoint: "settings/currency",
      method:   "patch",
      json:     true,
      payload:  { currency: selected },
    });
  };

  return (
    <section className="p-4 md:p-6 space-y-5">

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800">Currency Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Choose your preferred currency — all amounts across the app will display in this currency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

        {/* ── Currency Picker ── */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Select Currency
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {CURRENCY_META.map((meta, i) => {
              const sym      = CURRENCY_LIST.find((c) => c.name === meta.name)?.symbol ?? "";
              const isActive = selected === meta.name;

              return (
                <button
                  key={meta.name}
                  type="button"
                  onClick={() => setSelected(meta.name)}
                  className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors
                    ${i !== CURRENCY_META.length - 1 ? "border-b border-slate-100" : ""}
                    ${isActive ? "bg-indigo-50" : "hover:bg-slate-50 active:bg-slate-100"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black transition-colors
                      ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25" : "bg-slate-100 text-slate-500"}`}
                  >
                    {sym}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                      {meta.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{meta.region}</p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                      ${isActive ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}
                  >
                    {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div className="space-y-4">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Preview</p>
              <p className="text-xs text-slate-500">How amounts will appear across the app</p>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl px-4 py-4">
              <span className="text-4xl font-black text-indigo-600">{selectedSymbol}</span>
              <div>
                <p className="text-sm font-black text-slate-800">{selected}</p>
                <p className="text-xs text-slate-400">{selectedMeta?.region}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sample Amounts</p>
              <div className="space-y-1.5">
                {[
                  { label: "Dinner Split (per head)", idx: 0 },
                  { label: "Monthly Rent Split",       idx: 1 },
                  { label: "Cab Fare Split",            idx: 2 },
                ].map(({ label, idx }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-sm font-black text-slate-800">
                      {selectedSymbol}{selectedMeta?.preview[idx].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">You Owe</p>
                <p className="text-base font-black text-rose-600 mt-1">
                  -{selectedSymbol}{selectedMeta?.preview[0].toFixed(2)}
                </p>
              </div>
              <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Owed To You</p>
                <p className="text-base font-black text-emerald-600 mt-1">
                  +{selectedSymbol}{selectedMeta?.preview[2].toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {!isDirty && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-700">
                {savedName} is currently active across the app.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleApply}
            disabled={!isDirty || isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSaving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : isDirty ? `Apply ${selectedSymbol} — ${selected}` : "Already Applied"
            }
          </button>
        </div>
      </div>
    </section>
  );
};

export default CurrencySettingsPage;
