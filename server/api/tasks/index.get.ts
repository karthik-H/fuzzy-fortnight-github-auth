import { defineEventHandler, type H3Event } from 'h3';
import prisma from '~~/database/db';
import type { DataResponse } from '~~/server/interfaces/dataResponse.interface';
import type { ITaskGet } from '~~/common/types/responses/taskResponse.interface';
import { apiFail } from '../../utils/responseHandlers';

export default defineEventHandler(
  async (event: H3Event): Promise<DataResponse<ITaskGet[]>> => {
    try {
      const user = event.context.user;

      if (!user?.id) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
        });
      }

      const tasks = await prisma.task.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          userId: task.userId,
          createdAt: task.createdAt.toISOString(),
        })),
        message: 'Successfully retrieved tasks',
        success: true,
      };
    } catch (error) {
      throw apiFail(error, 'Failed to retrieve tasks');
    }
  },
);
