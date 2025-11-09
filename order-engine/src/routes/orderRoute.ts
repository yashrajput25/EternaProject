    import { FastifyInstance } from "fastify";
    import { generateOrderId } from "../utils/helpers";

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

    
    server.get("/orders/updates", { websocket: true }, (socket, req) => {
        console.log("🔌 WebSocket connected");

        const statuses = ["pending", "routing", "building", "submitted", "confirmed"];
        let index = 0;

        const interval = setInterval(() => {
        if (index < statuses.length) {
            socket.send(JSON.stringify({ status: statuses[index] }));
            index++;
        } else {
            clearInterval(interval);
            socket.close();
        }
        }, 1000);

        socket.on("close", () => {
        console.log("❌ WebSocket disconnected");
        clearInterval(interval);
        });
    });
    }