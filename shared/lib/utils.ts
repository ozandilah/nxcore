import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert prisma object into a regular JS object
export function convertTopPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Format Errors
export async function formatError(error: unknown): Promise<string> {
  if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError" && 'issues' in error) {
    // Handle Zod error
    const zodError = error as unknown as { issues: Array<{ path: (string | number)[]; message: string }> };
    const fieldErrors = zodError.issues.map((issue) => {
      const field = issue.path.join('.');
      return `${field}: ${issue.message}`;
    });

    return fieldErrors.join('. ');
  } else {
    // Handle other errors (including API service errors)
    const errorObj = error as { message?: unknown };
    return typeof errorObj.message === "string"
      ? errorObj.message
      : JSON.stringify(errorObj.message);
  }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
  } else {
    throw new Error("Value must be a number or a string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

// Format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(parseFloat(amount));
  } else {
    return "NaN";
  }
}

// Format number
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}
// Short UUID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "id-ID",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "id-ID",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "id-ID",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// const testDate = new Date('2025-08-23T08:30:00Z');
// const formatted =formatDateTime(testDate)
// console.log('Full DateTime:', formatted.dateTime)
// console.log('Date Only:', formatted.dateOnly)
// console.log('Time DateTime:', formatted.timeOnly)

// Form the pagination links

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}): string {
  // const currentParams = qs.parse(params);

  // if (value === null || value === undefined || value === "") {
  //   delete currentParams[key];
  // } else {
  //   currentParams[key] = value;
  // }

  // return qs.stringify(currentParams, { skipNull: true, skipEmptyString: true });
  const query = qs.parse(params);
  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}
