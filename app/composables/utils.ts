import type { DataResponse } from '~/types/api';

interface IRequestConstructor {
  apiPath: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export const useUtils = () => {
  async function useApi<IData>({
    apiPath,
    method = 'GET',
    headers = { 'Content-Type': 'application/json' },
    body,
    params,
  }: IRequestConstructor): Promise<DataResponse<IData>> {
    try {
      const response = await $fetch<DataResponse<IData>>(apiPath, {
        method,
        headers,
        body,
        params,
      });

      return response;
    } catch (apiError: unknown) {
      const err = apiError as { statusMessage?: string };
      return {
        error: apiError,
        message: err.statusMessage || 'Request failed',
        success: false,
      };
    }
  }

  return {
    useApi,
  };
};
