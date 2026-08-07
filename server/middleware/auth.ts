import {
  defineEventHandler,
  createError,
  getCookie,
  getHeader,
  type H3Event,
} from 'h3';
import { checkJwtToken } from '../utils/jwt';
import prisma from '../../database/db';
import type { Role } from '~~/common/constants/appConstants';

declare module 'h3' {
  interface H3EventContext {
    user?: {
      id: number;
      role: Role;
    };
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const publicApiRoutes = [
    '/api/_nuxt_icon',
    '/api/health',
    '/api/auth/github/callback',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/me',
    '/api/auth/logout',
  ];

  const pathName = getRequestURL(event).pathname;

  if (!pathName.startsWith('/api')) {
    return;
  }

  if (
    publicApiRoutes.some((route) =>
      route === '/' ? pathName === '/' : pathName.startsWith(route),
    )
  ) {
    return;
  }

  const authHeader = (getHeader(event, 'authorization') ?? '').toString();
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : getCookie(event, 'token');

  if (!token) {
    console.error('Auth Middleware: No token provided for: ', pathName);
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'No token provided',
    });
  }

  try {
    const decoded = await checkJwtToken(token);

    if (!decoded.success || !decoded.userId) {
      console.error('Auth Middleware: Invalid token payload: ', decoded);
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid token payload',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`Auth Middleware: User ${decoded.userId} not found`);
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'User not found',
      });
    }

    event.context.user = { id: user.id, role: user.role };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error(
      'Auth Middleware: Authentication failed for: ',
      pathName,
      error,
    );

    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
});
