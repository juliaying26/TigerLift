import { statusPillStyling } from "../utils/utils";

export default function Button({
  onClick,
  loading,
  disabled,
  className = "",
  children,
  status = "",
}) {
  const buttonStyling = statusPillStyling[status]
    ? `px-3 rounded-full ${statusPillStyling[status]}`
    : "";
  // real actions get a 44px tap target on phones; status pills and empty
  // placeholder buttons keep their size
  const isAction = !status && Boolean(children);

  const disabledStyling =
    "bg-zinc-100 text-zinc-400 hover:text-zinc-400 hover:bg-zinc-100";

  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-3 font-medium ${
        buttonStyling ? buttonStyling : "px-2.5 rounded-md"
      } ${isAction ? "max-md:min-h-11" : ""} ${className} ${
        disabled
          ? `${disabledStyling} 
           cursor-not-allowed hover:bg-zinc-100`
          : ""
      } ${
        loading ? `${disabledStyling} cursor-progress hover:bg-zinc-100` : ""
      }`}
      disabled={loading || disabled}
    >
      {children}
    </button>
  );
}
