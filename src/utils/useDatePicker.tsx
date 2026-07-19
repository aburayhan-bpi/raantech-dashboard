"use client";

import { startOfToday } from "date-fns";
import { useState } from "react";

export function useDatePicker(defaultDate?: Date) {
  const today = startOfToday();
  const [date, setDate] = useState<Date | undefined>(defaultDate || today);
  const [openCalendar, setOpenCalendar] = useState(false);

  // Optional helper to reset or clear
  const resetDate = () => setDate(today);

  return {
    date,
    setDate,
    openCalendar,
    setOpenCalendar,
    today,
    resetDate,
  };
}
