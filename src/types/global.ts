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

export interface IAdminProfile {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  permissions?: string[];
  status: string;
  isVerified: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

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
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  status?: string;
  permissions?: string[];
  profileImage?: string;
  isDeleted?: boolean;
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
