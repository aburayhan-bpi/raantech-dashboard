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
    id: "dashboard-inventory",
    label: "Inventory & Sales",
    icon: "FaBoxOpen",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "OVERVIEW",
    subItems: [
      { id: "sub-sales", label: "Sales & Exchange", href: "/sales", icon: "FaShoppingCart", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { id: "sub-products", label: "Products", href: "/products", icon: "FaBoxOpen", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { id: "sub-purchases", label: "Purchases", href: "/purchases", icon: "FaReceipt", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { id: "sub-suppliers", label: "Suppliers", href: "/suppliers", icon: "FaTruck", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { id: "sub-categories", label: "Categories", href: "/categories", icon: "FaTags", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
    ]
  },
  {
    id: "dashboard-management",
    label: "Management",
    icon: "HiUserGroup",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "OVERVIEW",
    subItems: [
      { id: "sub-customers", label: "Customers", href: "/customers", icon: "HiUserGroup", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { id: "sub-team", label: "Team Management", href: "/team", icon: "FaUsersCog", roles: ["SUPER_ADMIN"] },
    ]
  },
  {
    id: "dashboard-finance",
    label: "Finance",
    icon: "IoWallet",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "OVERVIEW",
    subItems: [
      { id: "sub-expenses", label: "Expenses", href: "/expenses", icon: "IoWallet", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
    ]
  },
  {
    id: "dashboard-system",
    label: "System",
    icon: "IoSettingsSharp",
    roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    group: "OVERVIEW",
    subItems: [
      { id: "sub-activity", label: "Activity Logs", href: "/activity-logs", icon: "HiClipboardDocumentList", roles: ["SUPER_ADMIN"] },
      { id: "sub-trash", label: "Recycle Bin", href: "/trash", icon: "TbTrashFilled", roles: ["SUPER_ADMIN"] },
      { id: "sub-settings", label: "Settings", href: "/settings", icon: "IoSettingsSharp", roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
    ]
  }
];

// website details like name, url, logo , etc
// THIS IS A WORKFLOW-DRIVEN B2B SAAS PLATFORM FOR AUDIT, COMPLIANCE AND SCORING.
export const WEBSITE_DETAILS = {
  SITE_NAME: "Raantech",
  SITE_SHORTNAME: "Raantech",
  SITE_ONLY_NAME: "Raantech",
  SITE_DESCRIPTION: "Enterprise Management Dashboard",
  SITE_DESC: "Dashboard",
  SITE_DASHBOARD_TITLE: "Raantech - Dashboard",
  SITE_DASHBOARD_SUBTITLE: "BUSINESS MANAGEMENT",
  SITE_LOGO: "/brand-logo.svg",
  SITE_FAVICON: "/brand-logo.svg",
  AVATAR1: "/placeholder/avatar1.jpg",
  AVATAR2: "/placeholder/avatar2.jpg",
};

export const paginationLimit = 25;

export const NAV_LINKS = [{ name: "Home", href: "/" }];
