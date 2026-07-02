const PrimaryButton = ({
  type = "button",
  loading = false,
  disabled = false,
  children,
  onClick,
}) => {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;