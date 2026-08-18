import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const LOGIN_URL = `${API_URL}/admin-user/login`;
export const REGISTER_URL = `${API_URL}/admin-user/signup`;
export const REQUEST_CHANGE_PASSWORD_URL = `${API_URL}/admin-user/me/change-password`;
export const REQUEST_CODE_URL = `${API_URL}/admin-user/request-reset-password-code`;
export const VERIFY_CODE_URL = `${API_URL}/admin-user/verify-reset-password-code`;
export const RESET_PASSWORD_URL = `${API_URL}/admin-user/reset-password`;

// Login function
export const login = (email: string, password: string, rememberMe: boolean) =>
  PromiseHandler(apiHelper("post", LOGIN_URL, { email, password, rememberMe }));

// Register function
export const register = (
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  captchaResponse: string
) =>
  PromiseHandler(
    apiHelper("post", REGISTER_URL, { email, firstName, lastName, password, captchaResponse })
  );

// Change password function
export const changePassword = (
  oldPassword: string,
  newPassword: string,
) =>
  PromiseHandler(
    apiHelper("put", REQUEST_CHANGE_PASSWORD_URL, {
      oldPassword,
      newPassword,
    })
  );

export const requestResetPasswordCode = (email: string) =>
  PromiseHandler(apiHelper("post", REQUEST_CODE_URL, { email }));

export const verifyResetCode = (email: string, code: string) =>
  PromiseHandler(apiHelper("post", VERIFY_CODE_URL, { email, code }));

export const resetPassword = (email: string, newPassword: string, confirmPassword: string) =>
  PromiseHandler(apiHelper("post", RESET_PASSWORD_URL, { email, newPassword, confirmPassword }));
