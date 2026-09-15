import { createTokenStorage } from "@/lib/token-storage";

const tokens = createTokenStorage("admin-token", "admin-refresh-token");

export const getAdminAccessToken = tokens.getAccessToken;
export const getAdminRefreshToken = tokens.getRefreshToken;
export const setAdminTokens = tokens.setTokens;
export const clearAdminTokens = tokens.clearTokens;
