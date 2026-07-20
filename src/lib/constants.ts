export const SIDEBAR_ITEMS = [
  // --------------------------------------------------------------------------
  // RAANTECH DASHBOARD - Sidebar Links
  // --------------------------------------------------------------------------
  {
    id: "dashboard-overview",
    label: "Overview",
    href: "",
    icon: "TbLayoutDashboardFilled",
    roles: ["SUPER_ADMIN", "ADMIN"],
    group: "OVERVIEW",
  },
  {
    id: "dashboard-sales",
    label: "Sales & Exchange",
    href: "/sales",
    icon: "FaShoppingCart",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "INVENTORY & SALES",
  },
  {
    id: "dashboard-products",
    label: "Products",
    href: "/products",
    icon: "FaBoxOpen",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "INVENTORY & SALES",
  },
  {
    id: "dashboard-categories",
    label: "Categories",
    href: "/categories",
    icon: "FaTags",
    roles: ["SUPER_ADMIN", "ADMIN"],
    group: "INVENTORY & SALES",
  },
  {
    id: "dashboard-customers",
    label: "Customers",
    href: "/customers",
    icon: "HiUserGroup",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "MANAGEMENT",
  },
  {
    id: "dashboard-team",
    label: "Team Management",
    href: "/team",
    icon: "FaUsersCog",
    roles: ["SUPER_ADMIN"],
    group: "MANAGEMENT",
  },
  {
    id: "dashboard-expenses",
    label: "Expenses",
    href: "/expenses",
    icon: "IoWallet",
    roles: ["SUPER_ADMIN", "ADMIN"],
    group: "FINANCE",
  },
  {
    id: "dashboard-activity",
    label: "Activity Logs",
    href: "/activity-logs",
    icon: "HiClipboardDocumentList",
    roles: ["SUPER_ADMIN"],
    group: "SYSTEM",
  },
  {
    id: "dashboard-settings",
    label: "Settings",
    href: "/settings",
    icon: "IoSettingsSharp",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "SYSTEM",
  },
];

// website details like name, url, logo , etc
// THIS IS A WORKFLOW-DRIVEN B2B SAAS PLATFORM FOR AUDIT, COMPLIANCE AND SCORING.
export const WEBSITE_DETAILS = {
  SITE_NAME: "Raantech",
  SITE_SHORTNAME: "Raantech",
  SITE_ONLY_NAME: "Raantech",
  SITE_DESCRIPTION: "Enterprise Management Dashboard",
  SITE_DESC: "Dashboard",
  SITE_DASHBOARD_TITLE: "Raantech — Dashboard",
  SITE_DASHBOARD_SUBTITLE: "BUSINESS MANAGEMENT",
  SITE_LOGO: "/brand-logo.svg",
  SITE_FAVICON: "/brand-logo.svg",
  AVATAR1: "/placeholder/avatar1.jpg",
  AVATAR2: "/placeholder/avatar2.jpg",
};

export const paginationLimit = 25;

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Feature", href: "/#feature" },
  { name: "Review", href: "/#review" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Contact", href: "/contact" },
];
