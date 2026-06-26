import React from "react";

const InputText = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  type = "text",
  required = false,
  disabled = false,
  error,
}) => {
  return (
    <div className="flex max-w-[480px] flex-wrap items-end gap-4 xsxl:text-[16px] xsm:text-[14px]">
      <label className="flex flex-col min-w-40 flex-1">
        <p className="text-text-light dark:text-text-dark  font-medium leading-normal pb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>

        <input
          name={name}
          type={type}
          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg 
            text-text-light dark:text-text-dark 
            focus:outline-0 focus:ring-none focus:ring-none 
            border border-border-light dark:border-border-dark 
            bg-component-light dark:bg-component-dark 
            h-14 placeholder:text-placeholder-light dark:placeholder-text-placeholder-dark 
            px-[10px] py-[10px]  font-normal leading-normal
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            ${error ? "border-red-500 focus:ring-red-500" : ""}
          `}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
        />

        <div className="h-[12px]">
          {error && <span className="text-red-500 text-[12px] mt-1">{error}</span>}
        </div>
      </label>
    </div>
  );
};

export default InputText;
