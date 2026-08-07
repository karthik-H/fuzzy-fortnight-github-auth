import type { JwtPayload } from 'jsonwebtoken';
import type { Role } from '~~/common/constants/appConstants';

export interface JwtTokenResult {
  success: boolean;
  decoded?: JwtPayload & { userId?: number; role?: Role };
  name?: string;
  message?: string;
  userId?: number;
  role?: Role;
}
