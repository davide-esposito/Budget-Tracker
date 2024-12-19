import { currencies } from "./currencies";

/**
 * @param date - The local Date object to convert.
 * @returns A new Date object in UTC.
 */
export function dateToUTCDate(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

/**
 * @param currency - The currency code (e.g., "USD", "EUR").
 * @returns A function that formats a number as currency.
 */
export function getFormatterForCurrency(currency: string): Intl.NumberFormat {
  const currencyData = currencies.find((c) => c.value === currency) ?? {
    value: "USD",
    locale: "en-US",
    label: "$ Dollar",
  };

  return new Intl.NumberFormat(currencyData.locale, {
    style: "currency",
    currency: currencyData.value,
  });
}
