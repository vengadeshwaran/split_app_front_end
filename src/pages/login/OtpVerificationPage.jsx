import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SplitSquareHorizontal, Mail, RotateCcw, ArrowLeft } from "lucide-react";
import { setUserState } from "../../redux/slice/userSlice";
import { setCurrency } from "../../redux/slice/currencySlice";
import { DEFAULT_CURRENCY, getSymbolByName } from "../../constants/currencies";
import { useReusableMutation } from "../../customHooks/useDataQuery";

const OTP_LENGTH  = 6;
const RESEND_SECS = 30;

const OtpVerificationPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const email = location.state?.email ?? "";

  const [digits,    setDigits]    = useState(Array(OTP_LENGTH).fill(""));
  const [error,     setError]     = useState("");
  const [verified,  setVerified]  = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  /* ── countdown timer ── */
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── focus first box on mount ── */
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  /* ── verify mutation ── */
  const { mutate: verifyEmail, isPending: verifying } = useReusableMutation({
    onSuccess: (res) => {
      setVerified(true);
      setTimeout(() => {
        const currencyName = res.user.preferred_currency || DEFAULT_CURRENCY.name;
        dispatch(setUserState({
          isAuthenticated: true,
          token:   res.token,
          name:    res.user.name,
          email:   res.user.email,
          user_id: res.user.id,
          is_admin: res.user.is_admin || false,
        }));
        dispatch(setCurrency({ name: currencyName, symbol: getSymbolByName(currencyName) }));
        navigate("/dashboard");
      }, 800);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Verification failed. Please try again.";
      setError(msg);
    },
  });

  /* ── resend mutation ── */
  const { mutate: resendEmail, isPending: resending } = useReusableMutation({
    onSuccess: () => {
      setDigits(Array(OTP_LENGTH).fill(""));
      setError("");
      setCountdown(RESEND_SECS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Please try again.";
      setError(msg);
    },
  });

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError("");
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleResend = () => {
    resendEmail({
      endPoint: "auth/resend-otp",
      method:   "post",
      json:     true,
      payload:  { email },
    });
  };

  const handleVerify = useCallback(() => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    verifyEmail({
      endPoint: "auth/verify-otp",
      method:   "post",
      json:     true,
      payload:  { email, otp },
    });
  }, [digits, email, verifyEmail]);

  const otp = digits.join("");

  /* ── verified flash ── */
  if (verified) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/25 mb-1">
            <SplitSquareHorizontal className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">SplitEasy</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-black text-slate-800">Email Verified!</p>
          <p className="text-xs text-slate-400">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── main screen ── */
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Check your inbox</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              We sent a 6-digit verification code to
            </p>
            <p className="text-sm font-bold text-slate-700 mt-0.5 break-all">{email}</p>
          </div>
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-13 text-center text-xl font-black rounded-xl border-2 outline-none transition-all
                ${d ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-800"}
                ${error ? "border-rose-400 bg-rose-50" : ""}
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
              style={{ height: "3.25rem" }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-[11px] font-bold text-rose-500 -mt-2">{error}</p>
        )}

        {/* Verify button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || otp.length < OTP_LENGTH}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Verifying…
            </>
          ) : "Verify Email"}
        </button>

        {/* Resend */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-400">Didn't receive the code?</p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
            >
              {resending ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              {resending ? "Sending…" : "Resend Code"}
            </button>
          ) : (
            <p className="text-xs font-bold text-slate-400">
              Resend in{" "}
              <span className="text-indigo-500 tabular-nums">{String(countdown).padStart(2, "0")}s</span>
            </p>
          )}
        </div>

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign Up
        </button>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
