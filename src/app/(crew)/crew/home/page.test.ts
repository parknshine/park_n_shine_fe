import { describe, it, expect } from "bun:test";
import { getResumeTarget } from "./page";
import type { CrewJob } from "@/features/crew/types";

function makeJob(overrides: Partial<CrewJob>): CrewJob {
  return {
    id: "job-1",
    bookingId: "job-1",
    status: "IN_PROGRESS",
    plateText: "B1234XYZ",
    slotText: "A1",
    assignedAt: null,
    etaEndsAt: null,
    supervisorPhone: "",
    media: [],
    checklist: [],
    ...overrides,
  };
}

// GET /jobs/active serializes before-photo kinds via MEDIA_TYPE_TO_KIND in
// CrewController, which round-trips the same "before_front" etc kind the
// crew app used to upload the photo. Resume logic must match that shape.
describe("getResumeTarget", () => {
  it("sends ASSIGNED jobs directly to the verify-plate step", () => {
    expect(getResumeTarget(makeJob({ status: "ASSIGNED" }))).toBe("/crew/jobs/job-1/verify");
  });

  it("sends LOCATED jobs directly to before-photos", () => {
    expect(getResumeTarget(makeJob({ status: "LOCATED" }))).toBe(
      "/crew/jobs/job-1/before-photos",
    );
  });

  it("sends IN_PROGRESS jobs with no before-photos to before-photos", () => {
    expect(getResumeTarget(makeJob({ status: "IN_PROGRESS", media: [] }))).toBe(
      "/crew/jobs/job-1/before-photos",
    );
  });

  it("sends IN_PROGRESS jobs with a before-photo missing to before-photos", () => {
    const media = [
      { id: "1", kind: "before_front", url: "u" },
      { id: "2", kind: "before_back", url: "u" },
      { id: "3", kind: "before_left", url: "u" },
    ] as CrewJob["media"];
    expect(getResumeTarget(makeJob({ status: "IN_PROGRESS", media }))).toBe(
      "/crew/jobs/job-1/before-photos",
    );
  });

  it("sends IN_PROGRESS jobs with all before-photos to wash", () => {
    const media = [
      { id: "1", kind: "before_front", url: "u" },
      { id: "2", kind: "before_back", url: "u" },
      { id: "3", kind: "before_left", url: "u" },
      { id: "4", kind: "before_right", url: "u" },
    ] as CrewJob["media"];
    expect(getResumeTarget(makeJob({ status: "IN_PROGRESS", media }))).toBe(
      "/crew/jobs/job-1/wash",
    );
  });

  it("sends IN_PROGRESS jobs with any after-photo uploaded to finish", () => {
    const media = [
      { id: "1", kind: "before_front", url: "u" },
      { id: "2", kind: "before_back", url: "u" },
      { id: "3", kind: "before_left", url: "u" },
      { id: "4", kind: "before_right", url: "u" },
      { id: "5", kind: "after_front", url: "u" },
    ] as CrewJob["media"];
    expect(getResumeTarget(makeJob({ status: "IN_PROGRESS", media }))).toBe(
      "/crew/jobs/job-1/finish",
    );
  });

  it("sends READY jobs to finish (done-washing flips status before after-photos exist)", () => {
    expect(getResumeTarget(makeJob({ status: "READY", media: [] }))).toBe(
      "/crew/jobs/job-1/finish",
    );
  });

  it("sends NEEDS_HELP and STALE jobs to the job detail page", () => {
    expect(getResumeTarget(makeJob({ status: "NEEDS_HELP" }))).toBe("/crew/jobs/job-1");
    expect(getResumeTarget(makeJob({ status: "STALE" }))).toBe("/crew/jobs/job-1");
  });
});
