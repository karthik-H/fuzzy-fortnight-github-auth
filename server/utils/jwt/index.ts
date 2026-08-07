import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { Role } from '~~/common/constants/appConstants';
import type { JwtTokenResult } from '~~/server/interfaces/jwt.interface';

const getJwtSecret = () => {
  return useRuntimeConfig().jwtSecret || process.env.JWT_SECRET || '';
};

export const createJwtToken = async (userId: number, role: Role) => {
  const token = jwt.sign({ userId, role }, getJwtSecret(), {
    expiresIn: '8h',
  });
  return token;
};

export const checkJwtToken = (token: string): Promise<JwtTokenResult> => {
  return new Promise((resolve) => {
    jwt.verify(token.replace('Bearer ', ''), getJwtSecret(), (err, decoded) => {
      if (err) {
        const { name, message } = err;
        console.error('Token validation error:', err);
        resolve({
          name,
          message,
          success: false,
        });
      } else {
        const payload = decoded as JwtPayload & {
          userId?: number;
          role?: Role;
        };
        resolve({
          success: true,
          decoded: payload,
          userId: payload.userId,
          role: payload.role,
        });
      }
    });
  });
};

export const extractUserFromToken = async (
  token: string,
): Promise<{ userId: number; role: Role } | null> => {
  try {
    const result = await checkJwtToken(token);
    if (result.success && result.userId && result.role) {
      return { userId: result.userId, role: result.role };
    }
    return null;
  } catch (error) {
    console.error('Error extracting userId/role from token:', error);
    return null;
  }
};
