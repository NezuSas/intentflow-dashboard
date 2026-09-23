const guayaquilDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Guayaquil",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "shortOffset",
});

const calendarDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export const formatGuayaquilDateTime = (value: string) =>
  guayaquilDateTime.format(new Date(value));

export const formatCalendarDate = (value: string) =>
  calendarDate.format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
