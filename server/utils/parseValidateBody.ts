import type { H3Event } from 'h3';
import type { DataResponse } from '../interfaces/dataResponse.interface';

export async function parseValidateBody<IData>(
  event: H3Event,
  bodyValidator: (value: IData) => boolean,
): Promise<DataResponse<IData>> {
  try {
    const body = await readBody(event);

    if (!bodyValidator(body)) {
      throw createError({
        statusCode: 404,
        statusMessage:
          'Request body is missing fields or incorrect data format',
      });
    }

    return {
      data: body as IData,
      message: 'Successfully validated request body',
      success: true,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 404,
      statusMessage: 'Invalid JSON format',
    });
  }
}
