import { useCallback, useEffect, useState } from "react";
import type { PageMeta, PaginatedResponse } from "@/core/Pagination";
import { getErrorMessage } from "@/utils/errors";

interface Settled<T> {
  /** Identifies which request produced this result; a mismatch with the current request means "loading". */
  key: string;
  data: T | null;
  error: string | null;
}

export interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Runs the loader again with the same arguments. */
  reload: () => void;
}

/**
 * Loads a resource whenever `load` changes identity (wrap it in `useCallback` with the inputs as deps).
 * Loading is derived from "the current request has not settled yet", so the effect never sets state
 * synchronously; previous data stays visible while a new request is in flight, and stale responses are ignored.
 */
export function useQuery<T>(load: () => Promise<T>): QueryResult<T> {
  const [version, setVersion] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [tracked, setTracked] = useState<{ load: () => Promise<T>; version: number } | null>(null);

  // A new loader or a reload starts a new request; its key is the pair (loader identity counter, version).
  const current = tracked && tracked.load === load && tracked.version === version ? tracked : null;
  const requestKey = `${version}`;

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setSettled({ key: requestKey, data, error: null });
      })
      .catch((cause: unknown) => {
        if (!cancelled) setSettled((previous) => ({ key: requestKey, data: previous?.data ?? null, error: getErrorMessage(cause) }));
      })
      .finally(() => {
        if (!cancelled) setTracked({ load, version });
      });
    return () => {
      cancelled = true;
    };
  }, [load, version, requestKey]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return {
    data: settled?.data ?? null,
    error: current ? settled?.error ?? null : null,
    loading: current === null,
    reload,
  };
}

export interface PagedQueryResult<T> {
  items: T[];
  meta: PageMeta | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Adjusts the items shown without a round trip (optimistic updates). */
  patchItems: (update: (items: T[]) => T[]) => void;
}

/** `useQuery` for paginated lists: exposes items and page metadata and allows optimistic patches. */
export function usePagedQuery<T>(load: () => Promise<PaginatedResponse<T>>): PagedQueryResult<T> {
  const query = useQuery(load);
  const [patched, setPatched] = useState<{ base: PaginatedResponse<T> | null; items: T[] } | null>(null);
  const base = query.data;
  const items = patched && patched.base === base ? patched.items : base?.data ?? [];

  const patchItems = useCallback(
    (update: (items: T[]) => T[]) => setPatched((previous) => ({ base, items: update(previous && previous.base === base ? previous.items : base?.data ?? []) })),
    [base]
  );

  return { items, meta: base?.meta ?? null, loading: query.loading, error: query.error, reload: query.reload, patchItems };
}
