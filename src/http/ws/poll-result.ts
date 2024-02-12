import { FastifyInstance } from "fastify";
import { voting } from "../../utils/votingPubSub";
import z from "zod";

export const pollResults = async (app: FastifyInstance) => {
  const param = z.object({
    pollid: z.string().uuid(),
  });
  app.get(
    "/polls/:pollid/results",
    { websocket: true },
    (connection, request) => {
      const { pollid } = param.parse(request.params);
      voting.subscribe(pollid, (message) => {
        connection.socket.send(JSON.stringify(message));
      });
    }
  );
};
