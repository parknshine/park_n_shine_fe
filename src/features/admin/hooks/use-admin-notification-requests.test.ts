import { describe, it, expect } from "bun:test";
import { useAdminNotificationRequests } from "@/features/admin/hooks/use-admin-notification-requests";

describe("useAdminNotificationRequests", () => {
  it("is exported as a function", () => {
    expect(typeof useAdminNotificationRequests).toBe("function");
  });
});
