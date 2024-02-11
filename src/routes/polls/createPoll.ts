import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export const createPoll = async (app: FastifyInstance) => {
  const createPollBody = z.object({
    title: z.string(),
    options: z.array(z.string()),
  });

  app.post("/polls", async (request, response) => {
    const { title, options } = createPollBody.parse(request.body);
    const param = z.object({
      pollid: z.string().uuid(),
    });
    const { pollid } = param.parse(request.params);
    const poll = await prisma.poll.create({
      data: {
        title: title,
        options: {
          createMany: {
            data: options.map((option) => {
              return { title: option };
            }),
          },
        },
      },
    });

    return response.status(201).send({ message: "poll created", data: poll });
  });
};
