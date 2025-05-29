import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// Secret key for JWT signing and verification
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_for_development_only'
);

/**
 * Sign a JWT token with the given payload
 */
export async function signToken(payload: any) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token expires in 1 day
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Set the authentication cookie in the response
 */
export function setAuthCookie(response: NextResponse, token: string) {
  // Set the token as an HTTP-only cookie
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day in seconds
    sameSite: 'strict',
  });

  return response;
}

/**
 * Clear the authentication cookie
 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}

/**
 * Get the authenticated user from the request cookies
 */
export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(req: NextRequest) {
  const user = await getAuthUser(req);
  return !!user;
}

/**
 * Check if the user has admin role
 */
export async function isAdmin(req: NextRequest) {
  const user = await getAuthUser(req);
  return user && user.role === 'ADMIN';
}
