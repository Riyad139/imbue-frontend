/* eslint-disable no-console */
import jwt from 'jsonwebtoken';

import { getTokenCookie } from '@/lib/auth-cookies';

export const ensureParams = (record: Record<string, any>, params: string[]) => {
  try {
    for (const name of params) {
      if (!(record[name] && String(record[name]).trim())) {
        throw new Error(`Missing ${name} param.`);
      }
    }
  } catch (e) {
    // FIXME: error handling
    console.error(e);
  }
};

export function verifyUserIdFromJwt(req: any, res: any, user_id: number) {
  const token = getTokenCookie(req);
  if (!token) {
    return res
      .status(401)
      .send('You are not authorized to access this resource.');
  }

  try {
    const decoded: any = jwt.verify(token, jwtOptions.secretOrKey);
    if (user_id == decoded.id) {
      return res;
    } else {
      return res
        .status(401)
        .send('You are not authorized to access this resource.');
    }
  } catch (error) {
    return res.status(401).send('Invalid token.');
  }
}

export const jwtOptions = {
  jwtFromRequest: getTokenCookie,
  secretOrKey: process.env.JWTSecret ?? 'mysecretword',
};
