let now = 0;
let interval: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

export const adminClock = {
  getSnapshot: () => now,
  getServerSnapshot: () => 0,
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    if (interval === undefined) {
      now = Date.now();
      interval = setInterval(() => {
        now = Date.now();
        listeners.forEach((listener) => listener());
      }, 30_000);
    }
    return () => {
      listeners.delete(onChange);
      if (listeners.size === 0 && interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
      }
    };
  },
};
