import { useSyncExternalStore } from "react";
export function useHash() {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener("hashchange", listener);
      return () => window.removeEventListener("hashchange", listener);
    },
    () => window.location.hash,
  );
}
