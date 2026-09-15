import { createTokenStorage } from "@/lib/token-storage";

const tokens = createTokenStorage("crew-token", "crew-refresh-token");

export const getCrewAccessToken = tokens.getAccessToken;
export const getCrewRefreshToken = tokens.getRefreshToken;
export const setCrewTokens = tokens.setTokens;
export const clearCrewTokens = tokens.clearTokens;
