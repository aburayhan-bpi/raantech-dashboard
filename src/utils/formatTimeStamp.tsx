import { format, isValid, Locale, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

/**
 * Options interface for formatDate function
 */
interface FormatDateOptions {
  formatStr?: string;
  fallback?: string;
  locale?: Locale;
}

/**
 * Professional Date Formatter (TypeScript Version)
 * handles ISO strings, Date objects, and Timestamps.
 */
export const formatTimestamp = (
  date: string | Date | number | null | undefined,
  {
    formatStr = "MMMM do, yyyy",
    fallback = "N/A",
    locale = enUS,
  }: FormatDateOptions = {},
): string => {
  if (!date) return fallback;

  try {
    let parsedDate: Date;

    if (date instanceof Date) {
      parsedDate = date;
    } else if (typeof date === "string") {
      parsedDate = parseISO(date);
    } else {
      parsedDate = new Date(date);
    }

    // Check if the parsed date is actually valid
    if (!isValid(parsedDate)) {
      if (process.env.NODE_ENV !== "production") {
        // console.error(`Invalid date passed to formatDate: ${date}`);
      }
      return fallback;
    }

    return format(parsedDate, formatStr, { locale });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      // console.error("Date formatting error:", error);
    }
    return fallback;
  }
};

/**
 * ==========================================
 * USAGE EXAMPLES
 * ==========================================
 */

// 1. Basic Usage
// Uses default format: "January 25th, 2026"
// const displayDate = formatDate(phase.endDate);

// 2. Custom String Format
// Output: "25-01-2026"
// const numericDate = formatDate(phase.endDate, {
//   formatStr: "dd-MM-yyyy",
// });

// 3. Handling Null or Invalid Data
// If phase.startDate is null, returns: "Not Started"
// const status = formatDate(phase.startDate, {
//   fallback: "Not Started",
// });

// 4. Using Locales (e.g., Bengali or Spanish)
// Output: "২৫শে জানুয়ারি, ২০২৬"
// import { bn } from "date-fns/locale";
// const localDate = formatDate("2026-01-25", {
//   formatStr: "do MMMM, yyyy",
//   locale: bn,
// });

// 5. Including Relative Day and Time
// Output: "Sunday at 12:00 PM"
// const eventTime = formatDate(phase.endDate, {
//   formatStr: "eeee 'at' p",
// });

// 6. Practical React Implementation
/*
  const ProjectPhase = ({ phase }) => (
    <div>
      <h3>{phase.name}</h3>
      <p>Due: {formatDate(phase.endDate, { 
        formatStr: 'MMM dd, yyyy', 
        fallback: 'Pending' 
      })}</p>
    </div>
  );
*/
