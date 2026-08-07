import type { H3Event } from 'h3';
import type { DataResponse } from '../interfaces/dataResponse.interface';
import {
  isUserLoginPostValid,
  isUserRegisterPostValid,
  isUserSelfPostValid,
  isUserPreferenceValid,
} from '../utils/requestBodyTypeCheck';
import { parseValidateBody } from '../utils/parseValidateBody';
import prisma from '~~/database/db';
import bcrypt from 'bcrypt';
import { apiFail } from '../utils/responseHandlers';
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';
import type { IUserDb, IUserWithPasswordDb } from '../interfaces/user.interface';
import type {
  IUserLoginPost,
  IUserRegisterPost,
  IUserSelfPost,
} from '~~/common/types/requests/userRequest.interface';
import type { Prisma } from '@prisma/client';
import {
  DEFAULT_USER_DEVELOPER_PREFERENCES,
  type TUserPreferences,
} from '~~/common/constants/appConstants';
import { parseJsonObject } from '../utils/parseJsonObject';
import { checkJwtToken, createJwtToken } from '../utils/jwt';

export async function userLogin(
  event: H3Event,
): Promise<DataResponse<IUserSelfGet>> {
  try {
    const validatorResponse = await parseValidateBody<IUserLoginPost>(
      event,
      isUserLoginPostValid,
    );
    const postData = validatorResponse.data;

    const user: IUserWithPasswordDb | null = await prisma.user.findUnique({
      where: {
        email: postData.email,
      },
    });

    if (user) {
      if (user.isArchived) {
        throw createError({
          statusCode: 403,
          statusMessage: 'User has been archived',
        });
      }

      const isMatchedUser = await bcrypt.compare(
        postData.password,
        user.password,
      );

      if (isMatchedUser) {
        const userPreferences = parseJsonObject<
          Prisma.JsonValue,
          TUserPreferences
        >(user.preferences, isUserPreferenceValid);

        const token = await createJwtToken(user.id, user.role);

        setCookie(event, 'token', token);
        setCookie(
          event,
          'user',
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            preferences: userPreferences,
          }),
        );

        return {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            token,
            preferences: userPreferences,
          },
          message: 'Login successfully',
          success: true,
        };
      }

      throw createError({
        statusCode: 401,
        statusMessage: 'Username or Password is invalid',
      });
    }

    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  } catch (error) {
    throw apiFail(error, 'Failed to login user');
  }
}

export async function userLogout(
  event: H3Event,
): Promise<DataResponse<boolean>> {
  try {
    setCookie(event, 'token', '', { maxAge: -1 });
    setCookie(event, 'githubToken', '', { maxAge: -1 });
    setCookie(event, 'user', '', { maxAge: -1 });

    return {
      data: true,
      message: 'Logout successfully',
      success: true,
    };
  } catch (error) {
    throw apiFail(error, 'Failed to logout user');
  }
}

export async function me(event: H3Event): Promise<DataResponse<IUserSelfGet>> {
  try {
    const validatorResponse = await parseValidateBody<IUserSelfPost>(
      event,
      isUserSelfPostValid,
    );
    const postData = validatorResponse.data;

    const isValid = await checkJwtToken(postData.token);

    if (isValid.success) {
      const decoded = isValid.decoded as { userId: number };

      const user: IUserDb | null = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          isArchived: false,
        },
      });

      if (user) {
        const userPreferences = parseJsonObject<
          Prisma.JsonValue,
          TUserPreferences
        >(user.preferences, isUserPreferenceValid);

        const newToken = await createJwtToken(user.id, user.role);
        setCookie(event, 'token', newToken);
        setCookie(
          event,
          'user',
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            preferences: userPreferences,
          }),
        );

        return {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            preferences: userPreferences,
          },
          message: 'Successfully retrieve user identity via token',
          success: true,
        };
      }

      throw createError({
        statusCode: 404,
        statusMessage: 'User not found via token or invalid token',
      });
    }

    throw createError({
      statusCode: 404,
      statusMessage: 'User not found via token or invalid token',
    });
  } catch (error) {
    throw apiFail(error, 'Failed to retrieve self identity');
  }
}

export async function registerUser(
  event: H3Event,
): Promise<DataResponse<IUserSelfGet>> {
  try {
    const validatorResponse = await parseValidateBody<IUserRegisterPost>(
      event,
      isUserRegisterPostValid,
    );
    const postData = validatorResponse.data;

    if (postData.password !== postData.confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Passwords do not match',
      });
    }

    const user: IUserDb | null = await prisma.user.findUnique({
      where: {
        email: postData.email,
      },
    });

    if (user) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exist',
      });
    }

    const hashedPassword = await bcrypt.hash(postData.password, 10);

    const createUser: IUserDb = await prisma.user.create({
      data: {
        name: postData.name,
        email: postData.email,
        password: hashedPassword,
        auth0_user_id: '',
        preferences: DEFAULT_USER_DEVELOPER_PREFERENCES,
      },
    });

    return {
      data: {
        id: createUser.id,
        name: createUser.name,
        email: createUser.email,
        role: createUser.role,
        isActive: createUser.isActive,
        preferences: DEFAULT_USER_DEVELOPER_PREFERENCES,
      },
      message: 'Successfully create user',
      success: true,
    };
  } catch (error) {
    throw apiFail(error, 'Failed to create user');
  }
}
