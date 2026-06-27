import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, SplitSquareHorizontal } from "lucide-react";
import { setUserState } from "../../redux/slice/userSlice";
import { setCurrency } from "../../redux/slice/currencySlice";
import { getSymbolByName } from "../../constants/currencies";
import { useReusableMutation } from "../../customHooks/useDataQuery";

const SignUpPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError,    setApiError]    = useState("");

  const passwordMismatch = confirm.length > 0 && confirm !== password;

  const { mutate: registerUser, isPending } = useReusableMutation({
    onSuccess: (res) => {
      const currencyName = res.user.preferred_currency || 'Indian Rupee (₹)';
      dispatch(setUserState({
        isAuthenticated: true,
        token:    res.token,
        name:     res.user.name,
        email:    res.user.email,
        user_id:  res.user.id,
        is_admin: res.user.is_admin || false,
      }));
      dispatch(setCurrency({ name: currencyName, symbol: getSymbolByName(currencyName) }));
      navigate("/dashboard");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Please try again.";
      setApiError(msg);
      console.error("[Register Error]", err?.response ?? err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordMismatch) return;
    setApiError("");
    registerUser({
      endPoint: "auth/register",
      method: "post",
      json: true,
      payload: {
        fullName:        name,
        email:           email,
        password:        password,
        confirmPassword: confirm,
      },
    });
  };

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all";

  return (
    <div className="space-y-8">

      {/* Brand */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/25 mb-1">
          <SplitSquareHorizontal className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">SplitEasy</h1>
        <p className="text-sm text-slate-400">Split bills. Stay friends.</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">

        <div>
          <h2 className="text-lg font-black text-slate-800">Create account</h2>
          <p className="text-xs text-slate-400 mt-0.5">Get started for free — no credit card needed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                className={`${inputCls} pr-11 ${passwordMismatch ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-[10px] font-bold text-rose-500">Passwords do not match</p>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <p className="text-[11px] font-bold text-rose-500 text-center -mb-1">
              {apiError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={passwordMismatch || isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating Account…
              </>
            ) : "Create Account"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400 pt-1">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
