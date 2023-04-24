import { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import * as models from "../../models";
import { Brief, BriefSqlFilter, fetchItems } from "../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: briefId } = req.query;

  if (briefId === "search") {
    const result = await searchBriefs(req);

    return res.status(200).json(result);
  }
  else {
    if (!briefId) return;

    const response = await getBrief(briefId)
    return res.status(200).json(response)
  }
}

export async function getBrief(id: string | string[]) {
  if (!id) return

  let response;
  await db.transaction(async tx => {
    try {
      const brief = await models.fetchBrief(id)(tx);
      await Promise.all([
        brief.skills = await fetchItems(brief.skill_ids, "skills")(tx),
        brief.industries = await fetchItems(brief.industry_ids, "skills")(tx),
      ]);

      response = brief
    } catch (e) {
      response = (new Error(
        `Failed to fetch brief with id ${id}`,
        { cause: e as Error }
      ));
    }
  });
  return response
}

export async function searchBriefs(req: NextApiRequest) {
  let response;
  const data = req.body as BriefSqlFilter;
  await db.transaction(async (tx: any) => {
    try {
      const briefs: Array<Brief> = await models.searchBriefs(tx, data);

      await Promise.all([
        briefs,
        ...briefs.map(async (brief: any) => {
          brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
          brief.industries = await fetchItems(brief.industry_ids, "skills")(tx);
        }),
      ]);

      response = briefs;
    } catch (e) {
      new Error(`Failed to search for briefs ${data}`, { cause: e as Error });
    }
  });

  return response;
}
