import { FastifyInstance } from "fastify";
import { generateOrderId, sleep, generateMockTxHash } from "../utils/helpers";
import MockDexRouter from "../services/MockDexRouter";
import { orderQueue } from "../services/OrderQueue";
import { registerClient, removeClient } from "../utils/webSocketManager";



export default async function orderRoute(server: FastifyInstance) {



    // POST /api/orders/execute
server.post("/orders/execute", async (req, reply) => {
        const body = req.body as {
        tokenIn?: string;
        tokenOut?: string;
        amount?: number;
        };
    
        if (!body.tokenIn || !body.tokenOut || !body.amount) {
        return reply.status(400).send({ error: "Missing order parameters" });
        }
    
        // Create Order ID
        const orderId = generateOrderId();
    
        // Add order to BullMQ queue
        await orderQueue.addOrder({
        orderId,
        tokenIn: body.tokenIn,
        tokenOut: body.tokenOut,
        amount: body.amount,
        });
    
        return reply.send({
        success: true,
        message: "Order added to queue successfully",
        orderId,
        });
});





server.get("/orders/updates/:orderId", { websocket: true }, (socket, req) => {
    const { orderId } = req.params as { orderId: string };
    registerClient(orderId, socket);
    
        socket.send(JSON.stringify({ status: "connected", orderId }));
        socket.on("close", () => {
        removeClient(orderId);
        });
});

}