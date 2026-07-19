import {
  IChangePasswordPayload,
  IChangePasswordResponse,
  IEmailChangeConfirmPayload,
  IEmailChangeConfirmResponse,
  IEmailChangeSendOtpPayload,
  IEmailChangeSendOtpResponse,
  IForgotPasswordPayload,
  IForgotPasswordResponse,
  ILoginPayload,
  ILoginResponse,
  ILogoutPayload,
  ILogoutResponse,
  IRegisterPayload,
  IRegisterResponse,
  IResendOTPBaseResponse,
  IResendOTPReqBody,
  IResetPasswordPayload,
  IResetPasswordResponse,
  IVerifyOTPPayload,
  IVerifyOTPResponse,
} from "@/types/global";
import baseApi from "../baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, ILoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    googleLogin: builder.mutation<ILoginResponse, { accessToken: string }>({
      query: (body) => ({
        url: "/auth/google-login",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<ILogoutResponse, ILogoutPayload>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        body: {},
        credentials: "include",
      }),
    }),
    changePassword: builder.mutation<
      IChangePasswordResponse,
      IChangePasswordPayload
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    sendEmailChangeOtp: builder.mutation<
      IEmailChangeSendOtpResponse,
      IEmailChangeSendOtpPayload
    >({
      query: (body) => ({
        url: "/admin/email-change/send-otp",
        method: "POST",
        body,
      }),
    }),
    confirmEmailChange: builder.mutation<
      IEmailChangeConfirmResponse,
      IEmailChangeConfirmPayload
    >({
      query: (body) => ({
        url: "/admin/email-change/confirm",
        method: "POST",
        body,
      }),
    }),
    // step -1
    forgotPassword: builder.mutation<
      IForgotPasswordResponse,
      IForgotPasswordPayload
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    // resetPassword: builder.mutation<
    //   IResetPasswordResponse,
    //   IResetPasswordPayload
    // >({
    //   query: (body) => ({
    //     url: "/auth/reset-password",
    //     method: "POST",
    //     body,
    //   }),
    // }),
    // after signup verify otp sent to email
    signUp: builder.mutation<IRegisterResponse, IRegisterPayload>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),
    verifySignupOtp: builder.mutation<
      ILoginResponse,
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resendSignupOtp: builder.mutation<
      IResendOTPBaseResponse,
      { email: string }
    >({
      query: (body) => ({
        url: "/auth/resend-otp/signup",
        method: "POST",
        body,
      }),
    }),
    // step -3 final
    resetPassword: builder.mutation<
      IResetPasswordResponse,
      IResetPasswordPayload
    >({
      query: ({ resetToken, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { resetToken, newPassword },
        headers: {
          Authorization: `Bearer ${resetToken}`,
        },
      }),
    }),
    // step -2 resend otp
    resendOtp: builder.mutation<IResendOTPBaseResponse, IResendOTPReqBody>({
      query: (body) => ({
        url: "/auth/resend-otp/forgot-password",
        method: "POST",
        body,
      }),
    }),
    // step -2
    verifyOtp: builder.mutation<IVerifyOTPResponse, IVerifyOTPPayload>({
      query: (body) => ({
        url: "/auth/verify-forgot-password-otp",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useSendEmailChangeOtpMutation,
  useConfirmEmailChangeMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useSignUpMutation,
  useVerifySignupOtpMutation,
  useResendSignupOtpMutation,
} = authApi;
