import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pingRoute from "./routes/pingRoute";
import orderRoute from "./routes/orderRoute";

const server = Fastify({ logger: true });
server.register(websocketPlugin);

// test route
server.register(pingRoute, { prefix: "/api" });
server.register(orderRoute, { prefix: "/api" });


// start server
const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.log("✅ Server running on http://localhost:3000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
