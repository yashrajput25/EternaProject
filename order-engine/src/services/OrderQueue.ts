import dotenv from "dotenv";
dotenv.config();

console.log("🧩 Redis URL:", process.env.UPSTASH_REDIS_REST_URL);
console.log(
  "🧩 Redis Token:",
  process.env.UPSTASH_REDIS_REST_TOKEN ? "Loaded ✅" : "❌ Missing"
);

import { Queue, Worker, Job } from "bullmq";
import { sleep } from "../utils/helpers";
import MockDexRouter from "./MockDexRouter";
import { sendUpdate } from "../utils/webSocketManager";
import { AppDataSource } from "../config/db";
import { Order } from "../entities/Order";
import IORedis from "ioredis";

// ✅ Upstash Redis connection configuration for BullMQ
const redisConnection = new IORedis(
  process.env.UPSTASH_REDIS_REST_URL!.replace("https://", "rediss://"),
  {
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {},
  }
);

const connection = redisConnection;

export interface OrderJob {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

export class OrderQueue {
  queue: Queue;
  worker!: Worker;
  router: MockDexRouter;

  constructor() {
    this.queue = new Queue<OrderJob>("orders", { connection });
    this.router = new MockDexRouter();

    (async () => {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("✅ DB ready for OrderQueue");
      }

      // Worker starts only after DB initialization
      this.worker = new Worker<OrderJob, any>(
        "orders",
        async (job: Job<OrderJob>) => {
          if (!job) return;

          const repo = AppDataSource.getRepository(Order);
          const { orderId, tokenIn, tokenOut, amount } = job.data;

          const dbOrder = repo.create({ orderId, tokenIn, tokenOut, amount, status: "pending" });
          await repo.save(dbOrder);

          try {
            console.log(`🔁 Processing order: ${orderId}`);
            sendUpdate(orderId, { status: "pending" });

            await sleep(500);
            console.log("⚙️ Routing...");
            sendUpdate(orderId, { status: "routing" });
            dbOrder.status = "routing";
            await repo.save(dbOrder);

            const bestQuote = await this.router.getBestQuote(job.data);
            sendUpdate(orderId, {
              status: "best_dex",
              dex: bestQuote.dex,
              price: bestQuote.price,
            });

            await sleep(1000);
            sendUpdate(orderId, { status: "building" });
            dbOrder.status = "building";
            await repo.save(dbOrder);

            await sleep(500);
            sendUpdate(orderId, { status: "submitted" });
            dbOrder.status = "submitted";
            await repo.save(dbOrder);

            const result = await this.router.executeSwap(job.data, bestQuote.dex);

            sendUpdate(orderId, {
              status: "confirmed",
              txHash: result.txHash,
              dex: result.dex,
            });

            dbOrder.status = "confirmed";
            dbOrder.dex = result.dex;
            dbOrder.txHash = result.txHash;
            await repo.save(dbOrder);

            console.log(`✅ Order ${orderId} completed on ${result.dex}`);
            return dbOrder;
          } catch (err: any) {
            dbOrder.status = "failed";
            dbOrder.error = err.message;
            await repo.save(dbOrder);
            console.error(`❌ Order ${orderId} failed: ${err.message}`);
            sendUpdate(orderId, { status: "failed", error: err.message });
            throw err;
          }
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
    })();
  }

  async addOrder(order: OrderJob) {
    await this.queue.add(order.orderId, order, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });
  }
}

export const orderQueue = new OrderQueue();
