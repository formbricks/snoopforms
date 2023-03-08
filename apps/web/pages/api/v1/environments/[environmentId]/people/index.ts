import { getSessionOrUser } from "@/lib/apiHelper";
import { prisma } from "@formbricks/database";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  // Check Authentication
  const user: any = await getSessionOrUser(req, res);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const environmentId = req.query.environmentId?.toString();

  if (!environmentId) {
    return res.status(400).json({ message: "Missing environmentId" });
  }

  // GET
  if (req.method === "GET") {
    const people = await prisma.person.findMany({
      where: {
        environment: {
          id: environmentId,
        },
      },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    return res.json(people);
  }

  // Unknown HTTP Method
  else {
    throw new Error(`The HTTP ${req.method} method is not supported by this route.`);
  }
}
