// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCallback, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { usePagedQuery, useQuery } from "@/shared/hooks/useQuery";

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("useQuery", () => {
  it("is loading until the loader settles and then exposes the data", async () => {
    const request = deferred<string>();
    const load = vi.fn(() => request.promise);
    const { result } = renderHook(() => useQuery(load));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => request.resolve("hello"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("hello");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("keeps the previous data while reloading and reports errors without dropping it", async () => {
    let calls = 0;
    // The rejection is created when the loader runs, so nothing rejects before the hook can handle it.
    const load = vi.fn(() => (calls++ === 0 ? Promise.resolve("first") : Promise.reject(new Error("boom"))));
    const { result } = renderHook(() => useQuery(load));
    await waitFor(() => expect(result.current.data).toBe("first"));
    act(() => result.current.reload());
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe("first");
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
    expect(result.current.data).toBe("first");
  });

  it("ignores a stale response when the loader changes before it settles", async () => {
    const slow = deferred<string>();
    const fast = deferred<string>();
    const { result } = renderHook(() => {
      const [page, setPage] = useState(1);
      const load = useCallback(() => (page === 1 ? slow.promise : fast.promise), [page]);
      return { query: useQuery(load), setPage };
    });
    act(() => result.current.setPage(2));
    await act(async () => fast.resolve("page 2"));
    await waitFor(() => expect(result.current.query.data).toBe("page 2"));
    await act(async () => slow.resolve("page 1"));
    expect(result.current.query.data).toBe("page 2");
    expect(result.current.query.loading).toBe(false);
  });
});

describe("usePagedQuery", () => {
  const page = (items: string[]) => Promise.resolve({ data: items, meta: { count: items.length, page: 1, pageSize: 20, next: null, previous: null } });

  it("exposes items and meta and allows optimistic patches until the next load", async () => {
    let served = ["a", "b"];
    const load = vi.fn(() => page(served));
    const { result } = renderHook(() => usePagedQuery(load));
    await waitFor(() => expect(result.current.items).toEqual(["a", "b"]));
    expect(result.current.meta?.count).toBe(2);

    act(() => result.current.patchItems((items) => items.map((item) => item.toUpperCase())));
    expect(result.current.items).toEqual(["A", "B"]);

    served = ["c"];
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.items).toEqual(["c"]));
  });
});
