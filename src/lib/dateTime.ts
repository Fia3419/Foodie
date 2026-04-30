const pad = (value: number) => value.toString().padStart(2, "0");

export const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export const getLocalTimeInputValue = (date = new Date()) => {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const shiftLocalDateInputValue = (value: string, offsetDays: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  return getLocalDateInputValue(date);
};

export const getTimeZoneOffsetHeaderValue = () =>
  `${new Date().getTimezoneOffset()}`;
