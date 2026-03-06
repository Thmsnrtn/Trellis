import { useState, useEffect, useCallback } from "react";
import { sLoad, sSave } from "../utils/storage";

export function usePersistedState(key, fallback) {
  const [val, setVal] = useState(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sLoad(key, fallback).then((d) => {
      setVal(d);
      setReady(true);
    });
  }, []);

  const update = useCallback(
    (fn) => {
      setVal((prev) => {
        const next = typeof fn === "function" ? fn(prev) : fn;
        sSave(key, next);
        return next;
      });
    },
    [key]
  );

  return [val, update, ready];
}
