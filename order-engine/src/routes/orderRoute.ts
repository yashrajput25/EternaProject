import { FastifyInstance } from "fastify";
import { generateOrderId, sleep, generateMockTxHash } from "../utils/helpers";
import MockDexRouter from "../services/MockDexRouter";


export default async function orderRoute(server: FastifyInstance) {
  // POST /api/orders/execute
server.post("/orders/execute", async (req, reply) => {
    const body = req.body as {
        tokenIn?: string;
        tokenOut?: string;
        amount?: number;
        };

        // Validate
        if (!body.tokenIn || !body.tokenOut || !body.amount) {
        return reply.status(400).send({ error: "Missing order parameters" });
        }

        // Create Order ID
        const orderId = generateOrderId();

        // Return orderId
        return reply.send({
        success: true,
        message: "Order received successfully",
        orderId,
        });
    });

server.get("/orders/updates", { websocket: true }, async (socket, req) => {
        console.log("🔌 WebSocket connected");
    
        const router = new MockDexRouter();
    
        const fakeOrder = {
        orderId: "ORD-DEMO",
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 1.5,
        };
    
        // Step 1: Pending
        socket.send(JSON.stringify({ status: "pending" }));
        await sleep(500);
    
        // Step 2: Routing
        socket.send(JSON.stringify({ status: "routing" }));
        const bestQuote = await router.getBestQuote(fakeOrder);
        socket.send(JSON.stringify({ bestDex: bestQuote.dex, bestPrice: bestQuote.price }));
    
        // Step 3: Building
        socket.send(JSON.stringify({ status: "building" }));
        await sleep(1000);
    
        // Step 4: Submitted
        socket.send(JSON.stringify({ status: "submitted" }));
    
        // Step 5: Execute swap
        const result = await router.executeSwap(fakeOrder, bestQuote.dex);
    
        // Step 6: Confirmed
        socket.send(JSON.stringify({ status: "confirmed", txHash: result.txHash, dex: result.dex }));
    
        socket.close();
    });

}