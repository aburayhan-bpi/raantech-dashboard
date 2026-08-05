/**
 * Centralized Backend Types & Enums
 * This file contains all enums, types, and constants used across the backend models and APIs.
 * It is properly separated by feature/module for clarity.
 */

/* ==========================================================================
   USER MODULE TYPES & ENUMS
   ========================================================================== */

export const USER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'BANNED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

// Used in User Schema
export const DEFAULT_USER_ROLE: UserRole = 'STAFF';
export const DEFAULT_USER_STATUS: UserStatus = 'ACTIVE';


/* ==========================================================================
   PRODUCT MODULE TYPES & ENUMS
   ========================================================================== */

export const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_UNITS = ['pcs', 'kg', 'ltr', 'box', 'pack'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const WARRANTY_TYPES = ['Official Warranty', 'Supplier Warranty', 'Shop Warranty', 'Service Warranty', 'Replacement Warranty', 'Checking Warranty', 'No Warranty', 'Other'] as const;
export type WarrantyType = (typeof WARRANTY_TYPES)[number];

// Used in Product Schema
export const DEFAULT_PRODUCT_STATUS: ProductStatus = 'ACTIVE';
export const DEFAULT_PRODUCT_UNIT: ProductUnit = 'pcs';


/* ==========================================================================
   ACTIVITY LOG MODULE TYPES & ENUMS
   ========================================================================== */

export const ACTIVITY_ACTIONS = ['CREATED', 'UPDATED', 'DELETED', 'LOGIN', 'LOGOUT'] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_ENTITIES = ['USER', 'PRODUCT', 'CATEGORY', 'CUSTOMER', 'SALE', 'SYSTEM', 'SUPPLIER', 'PURCHASE'] as const;
export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];


/* ==========================================================================
   CATEGORY MODULE TYPES & ENUMS
   ========================================================================== */

// Currently Category has no specific enums, but space reserved here for future scaling


/* ==========================================================================
   SUPPLIER MODULE TYPES & ENUMS
   ========================================================================== */

export const SUPPLIER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const DEFAULT_SUPPLIER_STATUS: SupplierStatus = 'ACTIVE';


/* ==========================================================================
   PURCHASE MODULE TYPES & ENUMS
   ========================================================================== */

export const PURCHASE_PAYMENT_STATUSES = ['PAID', 'PARTIAL', 'DUE'] as const;
export type PurchasePaymentStatus = (typeof PURCHASE_PAYMENT_STATUSES)[number];

export const PURCHASE_PAYMENT_METHODS = ['CASH', 'BANK', 'MOBILE_BANKING', 'OTHER'] as const;
export type PurchasePaymentMethod = (typeof PURCHASE_PAYMENT_METHODS)[number];

export const PURCHASE_STATUSES = ['COMPLETED', 'CANCELLED'] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const DEFAULT_PURCHASE_PAYMENT_STATUS: PurchasePaymentStatus = 'DUE';
export const DEFAULT_PURCHASE_PAYMENT_METHOD: PurchasePaymentMethod = 'CASH';
export const DEFAULT_PURCHASE_STATUS: PurchaseStatus = 'COMPLETED';


/* ==========================================================================
   SALE MODULE TYPES & ENUMS
   ========================================================================== */

export const SALE_PAYMENT_STATUSES = ['PAID', 'PARTIAL', 'DUE', 'REFUND_DUE', 'REFUNDED', 'CANCELLED'] as const;
export type SalePaymentStatus = (typeof SALE_PAYMENT_STATUSES)[number];

export const SALE_PAYMENT_METHODS = ['CASH', 'BANK', 'MOBILE_BANKING', 'COD', 'OTHER'] as const;
export type SalePaymentMethod = (typeof SALE_PAYMENT_METHODS)[number];

export const SALE_REFUND_METHODS = ['CASH', 'BANK', 'MOBILE_BANKING', 'OTHER'] as const;
export type SaleRefundMethod = (typeof SALE_REFUND_METHODS)[number];

export const SALE_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'RETURNED'] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export const SALE_SOURCES = ['WEBSITE', 'FACEBOOK', 'WHATSAPP', 'DIRECT_MANUAL', 'OTHER'] as const;
export type SaleSource = (typeof SALE_SOURCES)[number];

export const DEFAULT_SALE_PAYMENT_STATUS: SalePaymentStatus = 'DUE';
export const DEFAULT_SALE_PAYMENT_METHOD: SalePaymentMethod = 'CASH';
export const DEFAULT_SALE_STATUS: SaleStatus = 'PENDING';
export const DEFAULT_SALE_SOURCE: SaleSource = 'DIRECT_MANUAL';
