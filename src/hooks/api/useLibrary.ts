/**
 * Prompt Library API hooks
 */

import { useState, useCallback } from "react";
import { apiGet, buildQueryString } from "@/lib/http";
import {
  LibraryList,
  LibraryItemDetail,
  TLibraryList,
  TLibraryItemDetail,
  TLibrarySearchParams,
  LibrarySearchParams,
} from "@/schemas/library";

export function useLibrary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TLibraryList | null>(null);

  const fetch = useCallback(async (params: TLibrarySearchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Validate params
      LibrarySearchParams.parse(params);

      const queryString = buildQueryString(params);
      const result = await apiGet(`/api/v2/library/${queryString}`, LibraryList);
      setData(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch library items");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

export function useLibraryItem(id?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TLibraryItemDetail | null>(null);

  const fetch = useCallback(
    async (itemId?: string) => {
      const finalId = itemId || id;
      if (!finalId) {
        throw new Error("Library item ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiGet(
          `/api/v2/library/${finalId}/`,
          LibraryItemDetail
        );
        setData(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch library item");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  return { data, loading, error, fetch };
}

/**
 * Fetch featured library items
 */
export function useFeaturedLibrary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TLibraryList | null>(null);

  const fetch = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiGet(
        `/api/v2/library/?is_featured=true&limit=${limit}`,
        LibraryList
      );
      setData(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to fetch featured library items");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}
