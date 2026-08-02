export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export enum StatusEnum {
  ACTIVE = "ACTIVE",
  APPROVED = "APPROVED",
  CLOSED = "CLOSED",
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  INACTIVE = "INACTIVE",
  DISPUTED = "DISPUTED",
  DISABLED = "DISABLED",
  SCHEDULED = "SCHEDULED",
  ERROR = "ERROR",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  UNKNOWN = "UNKNOWN",
  IN_PROGRESS = "IN_PROGRESS",
}

export const enum SaleStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  RETURNED = "RETURNED",
}

export const enum PaymentStatus {
  PAID = "PAID",
  DUE = "DUE",
  PARTIAL = "PARTIAL",
  REFUNDED = "REFUNDED",
}

export const enum PaymentMethod {
  COD = "COD",
  CASH = "CASH",
  BANK = "BANK",
  MOBILE_BANKING = "MOBILE_BANKING",
  OTHER = "OTHER",
}

export const enum IGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export const enum IUserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
}

export const enum IRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  USER = "USER",
}
// Types & Enums related to Contact Us form - END

export interface IBaseResponse<T = void> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: IMeta;
  data?: T;
}

export interface ChildrenProps {
  children: React.ReactNode;
}

// IUser
export interface IUser {
  id: string;
  profileImage: string | null;
  fullName: string;
  email: string;
  gender: string | null;
  accountType: IRole;
  status: IUserStatus;
  reportsCount: number;
  dateJoined: string;
  plan: string;
  roleLabel: string;
  role: string;
}

// auth flow types

// Login Types
export interface ILoginPayload {
  email: string;
  password: string;
}

export type ILoginResponse = IBaseResponse<{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
    permissions?: string[];
  };
}>;

export type ILogoutPayload = void;

export interface ILogoutResponse {
  success: boolean;
  message: string;
}

// Get Profile Types

export type TPermission =
  | "sales:view" | "sales:create" | "sales:update" | "sales:delete" | "sales:refund" | "sales:return"
  | "purchases:view" | "purchases:create" | "purchases:update" | "purchases:delete" | "purchases:return"
  | "products:view" | "products:create" | "products:update" | "products:delete" | "products:hard_delete"
  | "categories:view" | "categories:create" | "categories:update" | "categories:delete"
  | "suppliers:view" | "suppliers:create" | "suppliers:update" | "suppliers:delete"
  | "customers:view" | "customers:create" | "customers:update" | "customers:delete"
  | "expenses:view" | "expenses:create" | "expenses:update" | "expenses:delete";

export interface IAdminProfile {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  permissions?: TPermission[];
  status: string;
  isVerified: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export const STAFF_ALLOWED_PERMISSIONS: TPermission[] = [
  "sales:view", "sales:create",
  "products:view",
  "customers:view", "customers:create",
  "categories:view"
];

export const ADMIN_ALLOWED_PERMISSIONS: TPermission[] = [
  ...STAFF_ALLOWED_PERMISSIONS,
  "sales:update", "sales:refund", "sales:return",
  "products:create", "products:update", "products:delete", "products:hard_delete",
  "purchases:view", "purchases:create", "purchases:update", "purchases:return",
  "categories:create", "categories:update", "categories:delete",
  "suppliers:view", "suppliers:create", "suppliers:update", "suppliers:delete",
  "customers:update", "customers:delete",
  "expenses:view", "expenses:create", "expenses:update", "expenses:delete"
];

export type IGetProfileResponse = IBaseResponse<IAdminProfile>;

// =================== AUTHENTICATION ===================

// Register Types
export type IRegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  role?: string;
};

export type IRegisterResponse = IBaseResponse<{
  email: string;
}>;

// Password Change Types

// Forgot types
export interface IForgotPasswordPayload {
  email: string;
}
export type IForgotPasswordResponse = IBaseResponse<{ email: string }>;

// Resend OTP
export interface IResendOTPReqBody {
  email: string;
}
// export interface IResendOTPBaseResponse {
//   success: boolean;
//   statusCode: number;
//   message: string;
// }
export type IResendOTPBaseResponse = IBaseResponse;

export type IUploadFolder = "profile" | "activity-cover" | "banner";

export interface IUploadFilePayload {
  file: File;
  folder?: IUploadFolder;
}

export interface IUploadFileData {
  url: string;
  fileId?: string;
  filePath?: string;
  name?: string;
}

export type IUploadFileResponse = IBaseResponse<IUploadFileData>;

export interface IChangePasswordPayload {
  // for admin dashboard settings page
  oldPassword: string;
  newPassword: string;
}

export type IChangePasswordResponse = IBaseResponse<null>;

export type IEmailChangeSendOtpPayload = {
  newEmail: string;
};

export type IEmailChangeSendOtpResponse = IBaseResponse<{
  currentEmail: string;
  newEmail: string;
  otpExpiresInMinutes: number;
}>;

export type IEmailChangeConfirmPayload = {
  newEmail: string;
  otp: string;
};

export type IEmailChangeConfirmResponse = IBaseResponse<{
  id: string;
  email: string;
  role: IRole;
}>;

// Reset Password
// export interface IResetPasswordPayload {
//   newPassword: string;
//   confirmPassword: string;
// }
export interface IResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export type IResetPasswordResponse = IBaseResponse<null>;

// Verify OTP type
export interface IVerifyOTPPayload {
  email: string;
  otp: string;
}

export type IVerifyOTPResponse = IBaseResponse<{ resetToken: string }>;

// DASHBOARD ROUTES TYPES START

// --- USER MANAGEMENT API TYPES ---
export interface ITeamUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  status?: string;
  permissions?: string[];
  profileImage?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  address?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type IUsersResponse = IBaseResponse<ITeamUser[]>;
export type IInviteUserResponse = IBaseResponse<{ user: ITeamUser; emailSent: boolean }>;
export type IUpdateUserResponse = IBaseResponse<ITeamUser>;
export type IDeleteUserResponse = IBaseResponse<null>;

export interface IInviteUserPayload {
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  permissions?: string[];
}

export interface IUpdateUserPayload {
  name?: string;
  role?: "ADMIN" | "STAFF";
  status?: "ACTIVE" | "INACTIVE";
  permissions?: string[];
}

// --- ACTIVITY LOG API TYPES ---
export interface IActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  action: string;
  entityType: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export type IActivityLogResponse = IBaseResponse<IActivityLog[]>;

// --- CATEGORY API TYPES ---
export interface ICategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCategoryPayload {
  name: string;
  description?: string;
  image?: string;
}

export interface IUpdateCategoryPayload extends Partial<ICreateCategoryPayload> {
  id: string;
}

export type ICategoryResponse = IBaseResponse<ICategory>;
export type ICategoriesResponse = IBaseResponse<ICategory[]>;

// --- TRASH API TYPES ---
export interface ITrashItem {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  deletedAt?: string;
  updatedAt?: string;
}

export type ITrashResponse = IBaseResponse<ITrashItem[]>;
export type ITrashMutationResponse = IBaseResponse<null>;

// --- CUSTOMER API TYPES ---
export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  alternatePhone?: string;
  customerNo?: string;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
}

export type ICustomerResponse = IBaseResponse<ICustomer[]>;
export type ISingleCustomerResponse = IBaseResponse<ICustomer>;

// --- PRODUCT API TYPES ---
export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: string;
  buyingPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  tax: number;
  stock: number;
  alertQuantity: number;
  unit: string;
  sku?: string;
  barcode?: string;
  images: string[];
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  tags: string[];
  isDeleted: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  totalInventoryValue: number;
  totalRetailValue: number;
}

export interface ICreateProductPayload {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  buyingPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  tax?: number;
  stock: number;
  alertQuantity?: number;
  unit?: string;
  sku?: string;
  barcode?: string;
  images?: string[];
  status?: string;
  tags?: string[];
}

export type IUpdateProductPayload = Partial<ICreateProductPayload>;

export type IProductsResponse = IBaseResponse<IProduct[]>;
export type IProductResponse = IBaseResponse<IProduct>;
export type IProductStatsResponse = IBaseResponse<IProductStats>;

// --- PURCHASE API TYPES ---
import { PurchasePaymentMethod, PurchasePaymentStatus, PurchaseStatus } from "@/types/backend";
export interface IPurchaseItem {
  product: IProduct;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchase {
  id: string;
  purchaseNo: string;
  supplier: ISupplier; // Using ISupplier now
  items: IPurchaseItem[];
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  returnedAmount: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: PurchasePaymentMethod;
  purchaseDate: string;
  note?: string;
  status: PurchaseStatus;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePurchasePayload {
  supplier: string;
  items: { product: string; quantity: number; unitCost: number; total: number; }[];
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: PurchasePaymentMethod;
  purchaseDate?: string;
  note?: string;
}

export interface IPurchasePayment {
  id: string;
  purchase: string;
  amount: number;
  paymentMethod: PurchasePaymentMethod;
  paymentDate: string;
  note?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
}

export interface IAddPaymentPayload {
  amount: number;
  paymentMethod: PurchasePaymentMethod;
  paymentDate?: string;
  note?: string;
}

export interface IPurchaseReturnItem {
  product: IProduct | string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchaseReturn {
  id: string;
  purchase: string;
  supplier: string;
  items: IPurchaseReturnItem[];
  subTotal: number;
  tax: number;
  totalAmount: number;
  returnDate: string;
  note?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
}

export interface IReturnPurchasePayload {
  items: { product: string; quantity: number; unitCost: number; total: number; }[];
  subTotal: number;
  tax: number;
  totalAmount: number;
  returnDate?: string;
  note?: string;
}

export type PurchaseResponse = IBaseResponse<IPurchase[]>;
export type SinglePurchaseResponse = IBaseResponse<IPurchase>;
export type PurchasePaymentsResponse = IBaseResponse<IPurchasePayment[]>;
export type PurchaseReturnsResponse = IBaseResponse<IPurchaseReturn[]>;

// --- SALE API TYPES ---
import { SalePaymentStatus, SalePaymentMethod } from "@/types/backend";
export interface ISaleItem {
  id?: string;
  product: IProduct;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISale {
  id: string;
  saleNo: string;
  customer: ICustomer;
  items: ISaleItem[];
  subTotal: number;
  discount: number;
  tax: number;
  shippingCharge: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  refundedAmount?: number;
  paymentStatus: SalePaymentStatus;
  paymentMethod: SalePaymentMethod;
  saleDate: string;
  courierDetails?: string;
  note?: string;
  status: SaleStatus;
  statusHistory?: {
    id: string;
    status: SaleStatus;
    note?: string;
    updatedBy?: { id: string; name: string; };
    date: string;
  }[];
  createdBy: { id: string; name: string; email: string; };
  createdAt: string;
  updatedAt: string;
}

export interface ISalePayment {
  id: string;
  sale: string;
  amount: number;
  paymentMethod: SalePaymentMethod;
  paymentDate: string;
  note?: string;
  createdBy: { id: string; name: string; email: string; };
  createdAt: string;
  updatedAt: string;
}

export interface ISaleRefund {
  id: string;
  sale: string;
  amount: number;
  refundMethod: string;
  refundDate: string;
  note?: string;
  createdBy: { id: string; name: string; email: string; };
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSaleRequest {
  customer: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: { product: string; quantity: number; unitPrice: number; total: number; }[];
  subTotal: number;
  discount?: number;
  tax?: number;
  shippingCharge?: number;
  totalAmount: number;
  paidAmount?: number;
  paymentMethod: SalePaymentMethod;
  courierDetails?: string;
  note?: string;
}

export type SalesResponse = IBaseResponse<ISale[]>;
export type SingleSaleResponse = IBaseResponse<ISale>;
export type SalePaymentsResponse = IBaseResponse<{ history: ISalePayment[] }>;
export type SaleRefundsResponse = IBaseResponse<{ history: ISaleRefund[] }>;
export type SingleSalePaymentResponse = IBaseResponse<ISalePayment>;
export type SingleSaleRefundResponse = IBaseResponse<ISaleRefund>;

// --- SUPPLIER API TYPES ---
export interface ISupplier {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  status: "ACTIVE" | "INACTIVE";
  totalDue: number;
  createdAt: string;
  updatedAt: string;
}

export type SupplierResponse = IBaseResponse<ISupplier[]>;
export type SingleSupplierResponse = IBaseResponse<ISupplier>;
