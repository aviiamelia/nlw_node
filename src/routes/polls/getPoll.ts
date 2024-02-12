import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export const getpoll = async (app: FastifyInstance) => {
  app.get("/polls/:pollid", async (request, response) => {
    const param = z.object({
      pollid: z.string().uuid(),
    });
    const { pollid } = param.parse(request.params);

    const polls = await prisma.poll.findUnique({
      where: { id: pollid },
      include: { options: { select: { id: true, title: true } } },
    });
    return response.status(200).send({ message: "poll created", data: polls });
  });
};
