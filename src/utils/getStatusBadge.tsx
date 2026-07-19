export const getStatusBadge = (status: string) => {
  const normalized = status?.toUpperCase();

  switch (normalized) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-normal px-3 py-1";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border border-amber-200 text-normal px-3 py-1";
    case "OVERDUE":
      return "bg-red-50 text-red-700 ring-1 ring-red-200 text-normal px-3 py-1";
    case "CANCELED":
      return "bg-red-50 text-red-700 border border-red-200 text-normal px-3 py-1";
    case "PARTIALLY_PAID":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200 text-normal px-3 py-1";
    case "UNPAID":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200 text-normal px-3 py-1";
    case "CONFIRMED":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200 text-normal px-3 py-1";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200 text-normal px-3 py-1";
  }
};
