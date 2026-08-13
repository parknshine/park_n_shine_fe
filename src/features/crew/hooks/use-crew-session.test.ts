import { describe, it, expect } from "bun:test";
import { fetchCrewSession } from "./use-crew-session";
import type { CrewSession } from "@/features/crew/types";

describe("fetchCrewSession", () => {
  it("returns the session when the server confirms an active crew-token cookie", async () => {
    const session: CrewSession = {
      id: "crew-1",
      crewId: "crew-1",
      crewName: "Budi",
      siteId: "site-1",
      expiresAt: "2026-01-01T00:00:00.000Z",
      token: "",
    };
    const client = { get: async () => ({ data: session }) };

    expect(await fetchCrewSession(client)).toEqual(session);
  });

  it("returns null instead of throwing when the server has no active session", async () => {
    const client = {
      get: async () => {
        throw new Error("401 unauthorized");
      },
    };

    expect(await fetchCrewSession(client)).toBeNull();
  });
});
