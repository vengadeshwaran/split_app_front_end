const InputField = ({
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  autoFocus = false,
  helperText,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />

      {helperText && (
        <p className="text-[11px] text-gray-400 mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;