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

// Used in Product Schema
export const DEFAULT_PRODUCT_STATUS: ProductStatus = 'ACTIVE';
export const DEFAULT_PRODUCT_UNIT: ProductUnit = 'pcs';


/* ==========================================================================
   ACTIVITY LOG MODULE TYPES & ENUMS
   ========================================================================== */

export const ACTIVITY_ACTIONS = ['CREATED', 'UPDATED', 'DELETED', 'LOGIN', 'LOGOUT'] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_ENTITIES = ['USER', 'PRODUCT', 'CATEGORY', 'CUSTOMER', 'SALE', 'SYSTEM'] as const;
export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];


/* ==========================================================================
   CATEGORY MODULE TYPES & ENUMS
   ========================================================================== */

// Currently Category has no specific enums, but space reserved here for future scaling
