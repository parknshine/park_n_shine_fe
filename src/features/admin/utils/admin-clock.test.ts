import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { adminClock } from "./admin-clock";

describe("adminClock", () => {
  let now: number;
  let tick: () => void;
  let cleanups: Array<() => void>;

  beforeEach(() => {
    now = 1_000;
    cleanups = [];
    spyOn(Date, "now").mockImplementation(() => now);
    spyOn(globalThis, "setInterval").mockImplementation(
      (callback: TimerHandler) => {
        tick = callback as () => void;
        return 1 as ReturnType<typeof setInterval> & number;
      },
    );
    spyOn(globalThis, "clearInterval").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanups.forEach((cleanup) => cleanup());
    mock.restore();
  });

  it("keeps the snapshot stable between ticks even as time advances", () => {
    const onChange = mock(() => {});
    cleanups.push(adminClock.subscribe(onChange));
    expect(adminClock.getSnapshot()).toBe(1_000);

    for (let i = 0; i < 100; i++) {
      now++;
      expect(adminClock.getSnapshot()).toBe(1_000);
    }
    expect(onChange).not.toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30_000);

    now = 31_000;
    tick();
    expect(adminClock.getSnapshot()).toBe(31_000);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("always returns zero for server rendering and hydration", () => {
    expect(adminClock.getServerSnapshot()).toBe(0);
    expect(setInterval).not.toHaveBeenCalled();
    cleanups.push(adminClock.subscribe(() => {}));
    now = 31_000;
    tick();
    expect(adminClock.getServerSnapshot()).toBe(0);
  });

  it("shares the timer and stops it when the last subscriber leaves", () => {
    const first = mock(() => {});
    const second = mock(() => {});
    const unsubscribeFirst = adminClock.subscribe(first);
    const unsubscribeSecond = adminClock.subscribe(second);
    cleanups.push(unsubscribeFirst, unsubscribeSecond);
    expect(setInterval).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    expect(clearInterval).not.toHaveBeenCalled();
    now = 31_000;
    tick();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeSecond();
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  it("refreshes and restarts the timer on remount", () => {
    const unsubscribe = adminClock.subscribe(() => {});
    cleanups.push(unsubscribe);
    unsubscribe();
    now = 61_000;
    cleanups.push(adminClock.subscribe(() => {}));
    expect(adminClock.getSnapshot()).toBe(61_000);
    expect(setInterval).toHaveBeenCalledTimes(2);
  });
});
