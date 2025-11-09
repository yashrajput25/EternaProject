    import { Queue, Worker, Job } from "bullmq";
    import { sleep } from "../utils/helpers";
    import MockDexRouter from "./MockDexRouter";
    import { sendUpdate } from "../utils/webSocketManager";

    const connection = { host: "127.0.0.1", port: 6379 };

    export interface OrderJob {
    orderId: string;
    tokenIn: string;
    tokenOut: string;
    amount: number;
    }

    export class OrderQueue {
    queue: Queue;
    worker: Worker;
    router: MockDexRouter;

    constructor() {
        this.queue = new Queue<OrderJob>("orders", { connection });
        this.router = new MockDexRouter();

        this.worker = new Worker<OrderJob, any>(
        "orders",
        async (job: Job<OrderJob>) => {
            if (!job) return;

            const { orderId } = job.data;
            console.log(`🔁 Processing order: ${orderId}`);
            sendUpdate(orderId, { status: "pending" });

            await sleep(500);
            console.log("⚙️ Routing...");
            sendUpdate(orderId, { status: "routing" });
            const bestQuote = await this.router.getBestQuote(job.data);
            sendUpdate(orderId, {
            status: "best_dex",
            dex: bestQuote.dex,
            price: bestQuote.price,
            });

            await sleep(1000);
            sendUpdate(orderId, { status: "building" });

            await sleep(500);
            sendUpdate(orderId, { status: "submitted" });
            const result = await this.router.executeSwap(job.data, bestQuote.dex);

            sendUpdate(orderId, {
            status: "confirmed",
            txHash: result.txHash,
            dex: result.dex,
            });

            console.log(`✅ Order ${orderId} completed on ${result.dex}`);
            return {
            orderId,
            dex: bestQuote.dex,
            price: bestQuote.price,
            txHash: result.txHash,
            };
        },
        {
            connection,
            concurrency: 10,
        }
        );

        this.worker.on("failed", (job, err) => {
        if (!job) return;
        console.error(`❌ Order ${job.data.orderId} failed: ${err.message}`);
        sendUpdate(job.data.orderId, {
            status: "failed",
            error: err.message,
        });
        });
    }

    async addOrder(order: OrderJob) {
        await this.queue.add(order.orderId, order, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        });
    }
    }

    export const orderQueue = new OrderQueue();