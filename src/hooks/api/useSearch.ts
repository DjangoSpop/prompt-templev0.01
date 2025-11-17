/**
 * Unified Search API hooks
 */

import { useState, useCallback } from "react";
import { apiGet, buildQueryString } from "@/lib/http";
import {
  SearchResponse,
  TSearchResponse,
  TSearchParams,
  SearchParams,
  RelatedTemplatesResponse,
  TRelatedTemplatesResponse,
} from "@/schemas/search";

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TSearchResponse | null>(null);

  const search = useCallback(async (params: TSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      // Validate params
      SearchParams.parse(params);

      const queryString = buildQueryString(params);
      const result = await apiGet(`/api/v2/search/${queryString}`, SearchResponse);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Search failed");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, search, clear };
}

export function useRelatedTemplates(templateId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TRelatedTemplatesResponse | null>(null);

  const fetch = useCallback(
    async (id?: string) => {
      const finalId = id || templateId;
      if (!finalId) {
        throw new Error("Template ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiGet(
          `/api/v2/related/?template_id=${finalId}`,
          RelatedTemplatesResponse
        );
        setData(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch related templates");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [templateId]
  );

  return { data, loading, error, fetch };
}
