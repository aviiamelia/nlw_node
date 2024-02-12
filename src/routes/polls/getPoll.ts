import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";

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
    if (!polls) {
      return response.status(404).send({ mesange: "poll not found" });
    }
    const result = await redis.zrange(pollid, 0, -1, "WITHSCORES");
    const votes = result.reduce((obj, line, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];
        Object.assign(obj, { [line]: Number(score) });
      }
      return obj;
    }, {} as Record<string, number>);

    return response.status(200).send({
      poll: {
        id: polls.id,
        title: polls.title,
        options: polls.options.map((option) => {
          return {
            id: option.id,
            title: option.title,
            score: option.id in votes ? votes[option.id] : 0,
          };
        }),
      },
    });
  });
};
