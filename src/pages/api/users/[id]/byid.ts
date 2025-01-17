/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

export default nextConnect()
  .use(passport.initialize())
  .get(async (_req: NextApiRequest, res: NextApiResponse) => {
    try {
      res.status(200).json({ name: 'John Doe' });
    } catch (error: any) {
      // FIXME:
      console.error(error);
      res.status(401).send(error.message);
    }
  });
