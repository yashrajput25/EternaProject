import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import pingRoute from "./routes/pingRoute";
import orderRoute from "./routes/orderRoute";
import { initDB } from "./config/db";
import { orderQueue } from "./services/OrderQueue"; 

const server = Fastify({ logger: true });
server.register(websocketPlugin);

// test route
server.register(pingRoute, { prefix: "/api" });
server.register(orderRoute, { prefix: "/api" });

// start server
const start = async () => {
    try {
        await initDB();
        console.log("✅ PostgreSQL connected successfully");
    
        // ✅ Initialize the order queue only *after* DB is ready
        orderQueue; 
    
        await server.listen({ port: 3000, host: "0.0.0.0" });
        console.log("✅ Server running on http://localhost:3000");
        } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
