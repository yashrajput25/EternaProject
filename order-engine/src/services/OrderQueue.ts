import { Queue, Worker, Job } from "bullmq";
import { sleep } from "../utils/helpers";
import MockDexRouter from "./MockDexRouter";

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

        this.worker = new Worker<OrderJob, any>("orders", async (job: Job<OrderJob>) => {
        console.log(`🔁 Processing order: ${job.data.orderId}`);
        const order = job.data;

        await sleep(500);
        console.log("⚙️ Routing...");
        const bestQuote = await this.router.getBestQuote(order);

        await sleep(1000);
        console.log(`💱 Executing on ${bestQuote.dex}...`);
        const result = await this.router.executeSwap(order, bestQuote.dex);

        return {
            orderId: order.orderId,
            dex: bestQuote.dex,
            price: bestQuote.price,
            txHash: result.txHash,
        };
        }, {
        connection,
        concurrency: 10
        });

        this.worker.on("completed", (job, result) => {
        console.log(`✅ Order ${job.data.orderId} completed on ${result.dex}`);
        });

        this.worker.on("failed", (job, err) => {
            if(!job)return;
        console.error(`❌ Order ${job.data.orderId} failed: ${err.message}`);
        });
    }

    async addOrder(order: OrderJob) {
        await this.queue.add(order.orderId, order, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 }
        });
    }
}

export const orderQueue = new OrderQueue();
