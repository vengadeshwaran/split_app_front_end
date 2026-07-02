const InputRadio = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  helperText,
  name,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              required={required}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-2 focus:ring-indigo-500"
            />

            <span className="text-sm text-gray-700">
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {helperText && (
        <p className="text-[11px] text-gray-400 mt-2">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputRadio;