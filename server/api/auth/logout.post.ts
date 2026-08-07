import { defineEventHandler, type H3Event } from 'h3';
import type { DataResponse } from '~~/server/interfaces/dataResponse.interface';
import { userLogout } from '../authService';

export default defineEventHandler(
  async (event: H3Event): Promise<DataResponse<boolean>> => {
    try {
      assertMethod(event, 'POST');
    } catch {
      throw createError({
        status: 405,
        statusMessage: 'Method is not allowed',
      });
    }

    return await userLogout(event);
  },
);
