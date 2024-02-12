import fastify from "fastify";

import { ascii } from "./ascii";
import { createPoll } from "../routes/polls/createPoll";
import { getpoll } from "../routes/polls/getPoll";
import { voteOnPoll } from "../routes/polls/voteOnPoll";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { pollResults } from "./ws/poll-result";

const port = 3333;
const app = fastify();
app.register(cookie, {
  secret: "aksjhdkahsdkhaksd",
  hook: "onRequest",
});
app.register(websocket);
app.register(createPoll);
app.register(getpoll);
app.register(voteOnPoll);
app.register(pollResults);

app
  .listen({
    port: port,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(ascii);
  });
