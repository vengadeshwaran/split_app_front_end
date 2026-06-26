const InputCheckBox = ({
  label,
  checked = false,
  onChange,
  required = false,
  disabled = false,
  helperText,
}) => {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
        />

        <div>
          <span className="text-sm text-gray-700 font-medium">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </span>

          {helperText && (
            <p className="text-[11px] text-gray-400 mt-1">
              {helperText}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};

export default InputCheckBox;