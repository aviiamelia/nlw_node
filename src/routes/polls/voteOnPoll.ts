import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { redis } from "../../lib/redis";

export const voteOnPoll = async (app: FastifyInstance) => {
  app.post("/polls/:pollid/votes", async (request, response) => {
    const param = z.object({
      pollid: z.string().uuid(),
    });
    const votePollBody = z.object({
      pollOptionId: z.string().uuid(),
    });
    const { pollOptionId } = votePollBody.parse(request.body);
    const { pollid } = param.parse(request.params);

    let sessionId = request.cookies.sessionId;

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId: pollid,
          },
        },
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        });
        await redis.zincrby(pollid, -1, userPreviousVoteOnPoll.pollOptionId);
      } else if (userPreviousVoteOnPoll) {
        return response
          .status(403)
          .send({ message: "you already voted in this poll" });
      }
    }

    if (!sessionId) {
      sessionId = randomUUID();
      response.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true,
      });
    }
    await prisma.vote.create({
      data: {
        sessionId,
        pollId: pollid,
        pollOptionId,
      },
    });

    await redis.zincrby(pollid, 1, pollOptionId);
    return response.status(201).send();
  });
};
