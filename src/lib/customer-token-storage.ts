import { createTokenStorage } from "@/lib/token-storage";

const tokens = createTokenStorage("pns_token", "pns_refresh");

export const getCustomerAccessToken = tokens.getAccessToken;
export const getCustomerRefreshToken = tokens.getRefreshToken;
export const setCustomerTokens = tokens.setTokens;
export const clearCustomerTokens = tokens.clearTokens;
