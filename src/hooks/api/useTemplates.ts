/**
 * Template API hooks
 */

import { useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, buildQueryString } from "@/lib/http";
import {
  TemplateList,
  TemplateDetail,
  TTemplateList,
  TTemplateDetail,
  TTemplateCreate,
  TTemplateUpdate,
  TTemplateRating,
  BookmarkResponse,
  TBookmarkResponse,
  TemplateCreate,
  TemplateUpdate,
  TemplateRating,
} from "@/schemas/template";
import { SuccessResponse } from "@/schemas/common";

interface UseTemplatesParams {
  search?: string;
  category?: string;
  tags?: string[];
  ordering?: string;
  page?: number;
  limit?: number;
  is_featured?: boolean;
  is_public?: boolean;
}

export function useTemplates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TTemplateList | null>(null);

  const fetch = useCallback(async (params: UseTemplatesParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(params);
      const result = await apiGet(`/api/v2/templates/${queryString}`, TemplateList);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch templates");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

export function useTemplate(id?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TTemplateDetail | null>(null);

  const fetch = useCallback(
    async (templateId?: string) => {
      const finalId = templateId || id;
      if (!finalId) {
        throw new Error("Template ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiGet(`/api/v2/templates/${finalId}/`, TemplateDetail);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch template");
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

export function useCreateTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: TTemplateCreate) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      TemplateCreate.parse(data);

      const result = await apiPost(`/api/v2/templates/`, TemplateDetail, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create template");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useUpdateTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (id: string, data: TTemplateUpdate) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      TemplateUpdate.parse(data);

      const result = await apiPatch(`/api/v2/templates/${id}/`, TemplateDetail, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update template");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

export function useBookmarkTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const bookmark = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiPost<TBookmarkResponse>(
        `/api/v2/templates/${id}/bookmark/`,
        BookmarkResponse
      );
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to bookmark template");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bookmark, loading, error };
}

export function useRateTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rate = useCallback(async (id: string, rating: TTemplateRating) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      TemplateRating.parse(rating);

      const result = await apiPost(
        `/api/v2/templates/${id}/rate/`,
        SuccessResponse,
        rating
      );
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to rate template");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rate, loading, error };
}
