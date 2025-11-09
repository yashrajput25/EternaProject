import { FastifyInstance } from "fastify";

export default async function pingRoute(server: FastifyInstance) {
  server.get("/ping", async (req, res) => {
    return { message: "pong" };
  });
}
