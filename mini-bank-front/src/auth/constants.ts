// Shared auth/constants used across auth components.
// Keep simple values here so auth files can export only React components/hooks
// default to local backend on port 3000 when env variable is not provided
// By default call the current origin (nginx) which will proxy API paths to the backend
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const TOKEN_KEY = "mini_bank_token";
export const USER_KEY = "mini_bank_user";
