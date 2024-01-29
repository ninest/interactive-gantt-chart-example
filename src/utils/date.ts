import { formatDate } from "date-fns";

export function dateToString(date: Date) {
  return formatDate(date, "yyyy-MM-dd");
}

export function dateFormatMonthDate(date: Date) {
  return formatDate(date, "MMM d");
}
