import request from "supertest";
import { FastifyInstance } from "fastify";
import websocketPlugin from "@fastify/websocket";
import orderRoute from "../src/routes/orderRoute";
import pingRoute from "../src/routes/pingRoute";
import Fastify from "fastify";
import { AppDataSource } from "../src/config/db";
beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({ logger: false });
  server.register(websocketPlugin);
  server.register(pingRoute, { prefix: "/api" });
  server.register(orderRoute, { prefix: "/api" });
  await server.ready();
  return server;
}
