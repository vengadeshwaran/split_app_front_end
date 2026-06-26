import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Bell, Languages, ShieldAlert, Check, BadgeIndianRupee, ChevronRight, Loader2, Pipette, KeyRound, Eye, EyeOff } from "lucide-react";
import { CURRENCY_LIST, getSymbolByName } from "../constants/currencies";
import { setCurrency } from "../redux/slice/currencySlice";
import { setUserState } from "../redux/slice/userSlice";
import { useResuableQuery, useReusableMutation } from "../customHooks/useDataQuery";

const PRESET_COLORS = [
  "#FF6B6B", "#FF8E53", "#FFD93D", "#6BCB77",
  "#4ECDC4", "#45B7D1", "#3D84FF", "#6C63FF",
  "#BB8FCE", "#F72585", "#E91E8C", "#94A3B8",
];

const languages = ["English", "Spanish", "French", "Arabic", "Hindi"];

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
      value ? "bg-indigo-600" : "bg-slate-200"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
        value ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const UserSettings = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const savedCurrencyName   = useSelector((s) => s.currency.name);
  const savedCurrencySymbol = useSelector((s) => s.currency.symbol);
  const isAdmin             = useSelector((s) => s.user.is_admin);

  const [name,         setName]         = useState("");
  const [colorCode,    setColorCode]    = useState("#6366f1");
  const [customColor,  setCustomColor]  = useState("#6366f1");
  const [saveMsg,      setSaveMsg]      = useState("");
  const [notifs,       setNotifs]       = useState({ push: true, email: true, sms: true });
  const [language,     setLanguage]     = useState("English");
  const colorInputRef = useRef(null);

  /* ── Change password state ── */
  const [pwCurrent,  setPwCurrent]  = useState("");
  const [pwNew,      setPwNew]      = useState("");
  const [pwConfirm,  setPwConfirm]  = useState("");
  const [showPw,     setShowPw]     = useState({ current: false, new: false, confirm: false });
  const [pwMsg,      setPwMsg]      = useState({ text: "", ok: false });

  /* ── Load profile ── */
  const { data: profile, isLoading: loadingProfile } = useResuableQuery({
    endpoint:  "users/profile",
    withToken: true,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setColorCode(profile.color_code || "#6366f1");
      setCustomColor(profile.color_code || "#6366f1");
    }
  }, [profile]);

  /* ── Save profile ── */
  const { mutate: saveProfile, isPending: isSaving } = useReusableMutation({
    onSuccess: (data) => {
      dispatch(setUserState({ name: data.name }));
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2500);
    },
    onError: () => setSaveMsg("Failed to save."),
  });

  /* ── Change password mutation ── */
  const { mutate: changePassword, isPending: isChangingPw } = useReusableMutation({
    onSuccess: () => {
      setPwMsg({ text: "Password changed successfully!", ok: true });
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => setPwMsg({ text: "", ok: false }), 3000);
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || "Failed to change password.";
      setPwMsg({ text: msg, ok: false });
    },
  });

  const handleChangePassword = () => {
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwMsg({ text: "All fields are required.", ok: false }); return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ text: "New passwords do not match.", ok: false }); return;
    }
    if (pwNew.length < 6) {
      setPwMsg({ text: "New password must be at least 6 characters.", ok: false }); return;
    }
    setPwMsg({ text: "", ok: false });
    changePassword({
      endPoint: "users/change-password",
      method:   "patch",
      json:     true,
      payload:  { currentPassword: pwCurrent, newPassword: pwNew },
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    setSaveMsg("");
    saveProfile({
      endPoint: "users/profile",
      method:   "patch",
      json:     true,
      payload:  { name: name.trim(), colorCode },
    });
  };

  const handleColorPick = (hex) => {
    setColorCode(hex);
    setCustomColor(hex);
  };

  const handleCustomChange = (e) => {
    setCustomColor(e.target.value);
    setColorCode(e.target.value);
  };

  const isPreset   = PRESET_COLORS.includes(colorCode);
  const isDirty    = profile && (name.trim() !== profile.name || colorCode !== profile.color_code);

  return (
    <section className="p-4 md:p-6 space-y-4">

      <div>
        <h1 className="text-xl font-black text-slate-800">Profile &amp; Preferences</h1>
        <p className="text-xs text-slate-400 mt-0.5">Update your name, avatar color, and app settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* ── LEFT: Edit Profile ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <p className="text-sm font-black text-slate-800">Edit Profile</p>
          </div>

          {loadingProfile ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading profile…</span>
            </div>
          ) : (
            <>
              {/* Avatar Preview */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 shadow-md transition-colors"
                  style={{ backgroundColor: colorCode }}
                >
                  {getInitials(name || "?")}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{name || "—"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wide mt-1 inline-block">
                    Your Avatar
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-colors"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Email <span className="normal-case text-[9px] text-slate-300 ml-1">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Avatar Color
                </label>

                {/* Preset colors */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleColorPick(hex)}
                      className={`w-8 h-8 rounded-xl transition-all ${
                        colorCode === hex
                          ? "ring-2 ring-offset-2 ring-slate-600 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {colorCode === hex && (
                        <Check className="w-4 h-4 text-white mx-auto" strokeWidth={3} />
                      )}
                    </button>
                  ))}

                  {/* Custom color dot */}
                  <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    title="Pick custom color"
                    className={`w-8 h-8 rounded-xl border-2 border-dashed flex items-center justify-center transition-all hover:scale-105 ${
                      !isPreset ? "border-slate-600 scale-110" : "border-slate-300"
                    }`}
                    style={{ backgroundColor: !isPreset ? colorCode : "transparent" }}
                  >
                    {isPreset
                      ? <Pipette className="w-3.5 h-3.5 text-slate-400" />
                      : <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    }
                  </button>
                </div>

                {/* Hidden color input */}
                <input
                  ref={colorInputRef}
                  type="color"
                  value={customColor}
                  onChange={handleCustomChange}
                  className="sr-only"
                />

                {/* Custom hex display */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg shrink-0 border border-slate-200"
                    style={{ backgroundColor: colorCode }}
                  />
                  <input
                    type="text"
                    value={colorCode}
                    onChange={(e) => {
                      const v = e.target.value;
                      setColorCode(v);
                      if (/^#[0-9A-Fa-f]{6}$/.test(v)) setCustomColor(v);
                    }}
                    maxLength={7}
                    placeholder="#6366f1"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono outline-none focus:border-indigo-400 bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Currency shortcut — admin only */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/currency")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 active:scale-[0.98] transition-all"
                >
                  <BadgeIndianRupee className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-slate-800">Currency Settings</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Active: <span className="font-bold text-indigo-600">{savedCurrencySymbol} — {savedCurrencyName}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Save */}
              <div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || !name.trim() || isSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : "Save Profile"}
                </button>
                {saveMsg && (
                  <p className={`text-xs font-bold text-center mt-2 ${saveMsg === "Saved!" ? "text-emerald-500" : "text-rose-500"}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">

          {/* Change Password */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-black text-slate-800">Change Password</p>
            </div>

            {[
              { label: "Current Password", value: pwCurrent, setter: setPwCurrent, field: "current" },
              { label: "New Password",     value: pwNew,     setter: setPwNew,     field: "new"     },
              { label: "Confirm New Password", value: pwConfirm, setter: setPwConfirm, field: "confirm" },
            ].map(({ label, value, setter, field }) => (
              <div key={field}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={showPw[field] ? "text" : "password"}
                    value={value}
                    onChange={(e) => { setter(e.target.value); setPwMsg({ text: "", ok: false }); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw[field]
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            ))}

            <div>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPw || !pwCurrent || !pwNew || !pwConfirm}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isChangingPw
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  : "Update Password"
                }
              </button>
              {pwMsg.text && (
                <p className={`text-xs font-bold text-center mt-2 ${pwMsg.ok ? "text-emerald-500" : "text-rose-500"}`}>
                  {pwMsg.text}
                </p>
              )}
            </div>
          </div>

          {/* Notifs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-black text-slate-800">Notification Preferences</p>
            </div>
            {[
              { key: "push",  label: "Push Alerts",      desc: "Realtime alerts when added to new splits" },
              { key: "email", label: "Email Digests",     desc: "Daily settlement logs and balance summaries" },
              { key: "sms",   label: "SMS Reminders",     desc: "Reminders for unpaid expense balances" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
                <Toggle value={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>

          {/* Language */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-black text-slate-800">Language</p>
            </div>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    language === lang
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lang}
                  {language === lang && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Developer Sandbox */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-black text-slate-800">Developer Sandbox</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate admin privileges locally to preview the admin dashboard behavior.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default UserSettings;
