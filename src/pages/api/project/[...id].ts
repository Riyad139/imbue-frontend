import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { verifyUserIdFromJwt } from '../auth/common';

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
  approvers?: string[];
};

export const authenticate = (
  method: string,
  req: NextApiRequest,
  res: NextApiResponse
) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      method,
      { session: false },
      (error: Error, token: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    )(req, res);
  });

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = id ? id[0] : "";
    const briefId = id ? id[1] : "";
    
    if(!projectId) return res.status(404).end();

    db.transaction(async (tx) => {
      try {

        let project;

        if(briefId) project = await models.fetchBriefProject(projectId, briefId)(tx);
        else project = await models.fetchProjectById(projectId)(tx)

        if (!project) {
          return res.status(404).end();
        }

        const milestones = await models.fetchProjectMilestones(projectId)(tx);
        const approvers = await models.fetchProjectApprovers(projectId)(tx);

        const pkg: ProjectPkg = {
          ...project,
          milestones,
          approvers: approvers.map(({ approver }: any) => approver),
        };

        return res.send(pkg);
      } catch (e) {
        return res.status(404).end();
        new Error(`Failed to fetch project by id: ${id}`, {
          cause: e as Error,
        });
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query, body } = req;
    const id: any = query.id as string[];
    // const brief_id: any = query.brief_id as string[];

    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );
    verifyUserIdFromJwt(req, res, userAuth.id);

    const {
      name,
      logo,
      description,
      website,
      category,
      required_funds,
      currency_id,
      chain_project_id,
      owner,
      milestones,
      total_cost_without_fee,
      imbue_fee,
      user_id,
      escrow_address,
      duration_id,
    } = body;
    db.transaction(async (tx) => {
      try {
        // ensure the project exists first
        const exists = await models.fetchProjectById(id)(tx);

        if (!exists) {
          return res.status(404).end();
        }

        if (exists.user_id !== user_id) {
          return res.status(403).end();
        }

        const project = await models.updateProject(id, {
          name,
          logo,
          description,
          website,
          category,
          chain_project_id,
          required_funds,
          currency_id,
          owner,
          total_cost_without_fee,
          imbue_fee,
          escrow_address,
          // project_type: exists.project_type,
          duration_id,
        })(tx);

        if (!project.id) {
          return new Error('Cannot update milestones: `project_id` missing.');
        }

        // drop then recreate
        await models.deleteMilestones(id)(tx);

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(milestones, project.id)(tx),
        };

        return res.status(200).send(pkg);
      } catch (cause) {
        new Error(`Failed to update project.`, { cause: cause as Error });
      }
    });
  });