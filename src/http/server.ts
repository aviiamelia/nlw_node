import { fastify } from "fastify";
import { ascii } from "./ascii";

const app = fastify();

app.listen({ port: 3333 }).then(() => {
  console.log(ascii);
});
