export const getDayName = (date) => {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(date)
    .toLowerCase();
};
