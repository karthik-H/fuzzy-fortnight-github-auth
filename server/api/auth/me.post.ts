import { defineEventHandler, type H3Event } from 'h3';
import type { DataResponse } from '~~/server/interfaces/dataResponse.interface';
import { me } from '../authService';
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';

export default defineEventHandler(
  async (event: H3Event): Promise<DataResponse<IUserSelfGet>> => {
    try {
      assertMethod(event, 'POST');
    } catch {
      throw createError({
        status: 405,
        statusMessage: 'Method is not allowed',
      });
    }

    return await me(event);
  },
);
