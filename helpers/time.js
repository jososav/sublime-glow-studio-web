export const getDayName = (date) => {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(date)
    .toLowerCase();
};

export const toAmPm = (slot) => {
  const [hourStr, minuteStr] = slot.split(":");
  let hour = parseInt(hourStr, 10);
  const minutes = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;

  if (hour === 0) hour = 12;

  return `${hour}:${minutes} ${ampm}`;
};
