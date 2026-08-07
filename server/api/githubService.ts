import type { H3Event } from 'h3';
import prisma from '~~/database/db';
import { isGithubCallbackPostValid, isUserPreferenceValid } from '../utils/requestBodyTypeCheck';
import { parseValidateBody } from '../utils/parseValidateBody';
import type { DataResponse } from '../interfaces/dataResponse.interface';
import { apiFail } from '../utils/responseHandlers';
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';
import type { IGithubCallbackPost } from '~~/common/types/requests/githubRequest.interface';
import type { IUserDb } from '../interfaces/user.interface';
import {
  DEFAULT_USER_DEVELOPER_PREFERENCES,
  Role,
  type TUserPreferences,
} from '~~/common/constants/appConstants';
import type { Prisma } from '@prisma/client';
import { parseJsonObject } from '../utils/parseJsonObject';
import { createJwtToken } from '../utils/jwt';
import { resolveWorkspaceMemberIdByEmail } from './workspaceService';

type GithubTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GithubUser = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
};

type GithubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

async function exchangeCodeForToken(code: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  // Env-configurable seam so tests / local mocks can override the token endpoint.
  const tokenUrl =
    process.env.GITHUB_OAUTH_TOKEN_URL ||
    'https://github.com/login/oauth/access_token';

  if (!clientId || !clientSecret || !redirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Failed to login user via GitHub SSO: GitHub OAuth is not configured',
    });
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!response.ok) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Failed to login user via GitHub SSO: Failed to exchange code for tokens',
    });
  }

  const data = (await response.json()) as GithubTokenResponse;

  if (!data.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage:
        data.error_description ||
        'Failed to login user via GitHub SSO: Failed to exchange code for tokens',
    });
  }

  return data.access_token;
}

type OidcUserinfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
};

function parseGithubUserId(sub: string): number {
  const asNumber = Number(sub);
  if (Number.isInteger(asNumber) && asNumber > 0) {
    return asNumber;
  }
  // Stable non-zero id for non-numeric mock subjects
  let hash = 0;
  for (let i = 0; i < sub.length; i += 1) {
    hash = (hash * 31 + sub.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

async function fetchGithubProfileFromUserinfo(
  accessToken: string,
  userinfoUrl: string,
): Promise<{ id: number; email: string; name: string }> {
  const response = await fetch(userinfoUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Failed to login user via GitHub SSO: Failed to fetch GitHub user profile',
    });
  }

  const profile = (await response.json()) as OidcUserinfo;
  if (!profile.sub || !profile.email) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Failed to login user via GitHub SSO: Missing GitHub email or user ID',
    });
  }

  return {
    id: parseGithubUserId(profile.sub),
    email: profile.email,
    name: profile.name || profile.preferred_username || '',
  };
}

async function fetchGithubProfile(accessToken: string): Promise<{
  id: number;
  email: string;
  name: string;
}> {
  // Env seam for mock-oauth2-server (OIDC userinfo) used by .codevalid tests.
  // When unset, use the live GitHub REST API (/user + /user/emails).
  const userinfoUrl = process.env.GITHUB_OAUTH_USERINFO_URL;
  if (userinfoUrl) {
    return fetchGithubProfileFromUserinfo(accessToken, userinfoUrl);
  }

  const apiBaseUrl = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';

  const userResponse = await fetch(`${apiBaseUrl}/user`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'fuzzy-fortnight-github-auth',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!userResponse.ok) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Failed to login user via GitHub SSO: Failed to fetch GitHub user profile',
    });
  }

  const user = (await userResponse.json()) as GithubUser;

  let email = user.email;

  // Public profile email is often null; fall back to the emails API for primary verified.
  if (!email) {
    const emailsResponse = await fetch(`${apiBaseUrl}/user/emails`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'fuzzy-fortnight-github-auth',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!emailsResponse.ok) {
      throw createError({
        statusCode: 401,
        statusMessage:
          'Failed to login user via GitHub SSO: Failed to fetch GitHub user emails',
      });
    }

    const emails = (await emailsResponse.json()) as GithubEmail[];
    const primaryVerified =
      emails.find((entry) => entry.primary && entry.verified) ||
      emails.find((entry) => entry.verified) ||
      emails[0];
    email = primaryVerified?.email ?? null;
  }

  if (!email || !user.id) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Failed to login user via GitHub SSO: Missing GitHub email or user ID',
    });
  }

  return {
    id: user.id,
    email,
    name: user.name || user.login || '',
  };
}

export async function callback(
  event: H3Event,
): Promise<DataResponse<IUserSelfGet>> {
  try {
    const validatorResponse = await parseValidateBody<IGithubCallbackPost>(
      event,
      isGithubCallbackPostValid,
    );
    const postData = validatorResponse.data;

    let accessToken: string;
    try {
      accessToken = await exchangeCodeForToken(postData.code);
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      throw createError({
        statusCode: 401,
        statusMessage:
          'Failed to login user via GitHub SSO: Failed to exchange code for tokens',
      });
    }

    const profile = await fetchGithubProfile(accessToken);
    const auth0UserId = `github|${profile.id}`;

    const workspaceMemberId = await resolveWorkspaceMemberIdByEmail(
      profile.email,
    );

    let user: IUserDb | null = await prisma.user.findUnique({
      where: {
        email: profile.email,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          password: '',
          auth0_user_id: auth0UserId,
          githubAccessToken: accessToken,
          role: Role.DEVELOPER,
          workspaceMemberId,
          preferences: DEFAULT_USER_DEVELOPER_PREFERENCES,
        },
      });
    } else {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name || profile.name || '',
          auth0_user_id: auth0UserId,
          githubAccessToken: accessToken,
          workspaceMemberId:
            user.workspaceMemberId !== 0
              ? user.workspaceMemberId
              : workspaceMemberId,
        },
      });
    }

    if (user.isArchived) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Failed to login user via GitHub SSO: User is archived',
      });
    }

    const token = await createJwtToken(user.id, user.role);

    const userPreferences = parseJsonObject<Prisma.JsonValue, TUserPreferences>(
      user.preferences,
      isUserPreferenceValid,
    );

    setCookie(event, 'token', token);
    setCookie(event, 'githubToken', accessToken);
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
        token,
      },
      message: 'Successfully login user via GitHub SSO',
      success: true,
    };
  } catch (error) {
    throw apiFail(error, 'Failed to login user via GitHub SSO');
  }
}
