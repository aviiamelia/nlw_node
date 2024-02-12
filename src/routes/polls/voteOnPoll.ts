import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { redis } from "../../lib/redis";
import { voting } from "../../utils/votingPubSub";

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
        const votes = await redis.zincrby(
          pollid,
          -1,
          userPreviousVoteOnPoll.pollOptionId
        );

        voting.publish(pollid, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes),
        });
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
    const votes = await redis.zincrby(pollid, 1, pollOptionId);
    voting.publish(pollid, {
      pollOptionId,
      votes: Number(votes),
    });
    return response.status(201).send();
  });
};
