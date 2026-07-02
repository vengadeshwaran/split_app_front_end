import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Eye, EyeOff, SplitSquareHorizontal } from "lucide-react";
import { setUserState } from "../../redux/slice/userSlice";
import { setCurrency } from "../../redux/slice/currencySlice";
import { DEFAULT_CURRENCY, getSymbolByName } from "../../constants/currencies";
import { useReusableMutation } from "../../customHooks/useDataQuery";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email,    setEmail]    = useState(() => localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("rememberedEmail"));
  const [showPw,   setShowPw]   = useState(false);
  const [apiError, setApiError] = useState("");

  const { mutate: loginUser, isPending } = useReusableMutation({
    onSuccess: async (res) => {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      dispatch(setUserState({
        isAuthenticated: true,
        token:    res.token,
        name:     res.user.name,
        email:    res.user.email,
        user_id:  res.user.id,
        is_admin: res.user.is_admin || false,
      }));
      try {
        const { data } = await axios.get("settings/currency", {
          headers: { Authorization: `Bearer ${res.token}` },
        });
        dispatch(setCurrency({ name: data.currency, symbol: getSymbolByName(data.currency) }));
      } catch {
        dispatch(setCurrency({ name: DEFAULT_CURRENCY.name, symbol: DEFAULT_CURRENCY.symbol }));
      }
      navigate("/dashboard");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setApiError(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError("");
    loginUser({
      endPoint: "auth/login",
      method:   "post",
      json:     true,
      payload:  { email, password },
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
          <h2 className="text-lg font-black text-slate-800">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-0.5">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

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
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <a href="#" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
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

          {/* Remember Me */}
          <div className="flex items-center py-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 accent-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-500 hover:text-slate-600 transition-colors">
                Remember me
              </span>
            </label>
          </div>

          {/* API Error */}
          {apiError && (
            <p className="text-[11px] font-bold text-rose-500 text-center">{apiError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </>
            ) : "Sign In"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400 pt-1">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
