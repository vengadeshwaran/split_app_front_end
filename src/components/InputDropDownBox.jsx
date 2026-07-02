import React from "react";

const InputDropDownBox = ({
  label,
  required = false,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  helperText,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {helperText && (
        <p className="text-[11px] text-gray-400 mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputDropDownBox;