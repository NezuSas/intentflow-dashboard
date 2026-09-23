import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "@/utils/errors";

export function useLazyCatalog<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<T> | null>(null);

  const load = useCallback((): Promise<T> => {
    if (data !== null) return Promise.resolve(data);
    if (inFlight.current) return inFlight.current;

    setLoading(true);
    setError(null);
    const request = loader()
      .then((result) => {
        setData(result);
        return result;
      })
      .catch((cause: unknown) => {
        setError(getErrorMessage(cause));
        throw cause;
      })
      .finally(() => {
        inFlight.current = null;
        setLoading(false);
      });

    inFlight.current = request;
    return request;
  }, [data, loader]);

  const invalidate = useCallback(() => setData(null), []);

  return { data, loading, error, load, invalidate };
}
