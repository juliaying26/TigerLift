export const MAX_CAPACITY = 5;

export const getFormattedDate = (date) => {
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export const inputStyling =
  "outline-1 outline-zinc-200 focus:outline-theme_medium_1 text-sm font-normal hover:outline-theme_medium_1";

export const autocompleteStyling =
  "px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal hover:outline-theme_medium_1";
