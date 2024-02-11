import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";

export const voteOnPoll = async (app: FastifyInstance) => {
  const createPollBody = z.object({
    title: z.string(),
    options: z.array(z.string()),
  });

  app.post("/polls/:pollid/votes", async (request, response) => {
    const param = z.object({
      pollid: z.string().uuid(),
    });
    const votePollBody = z.object({
      pollOptionId: z.string().uuid(),
    });
    const { pollid } = param.parse(request.params);
    const sessionId = randomUUID();

    return response.status(201).send({ message: "poll created", data: [] });
  });
};
