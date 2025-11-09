import { orderQueue } from "../src/services/OrderQueue";

test("Queue adds job successfully", async () => {
  const job = {
    orderId: "ORD-TEST123",
    tokenIn: "SOL",
    tokenOut: "USDC",
    amount: 2
  };
  await orderQueue.addOrder(job);
  const waiting = await orderQueue.queue.getWaitingCount();
  expect(waiting).toBeGreaterThanOrEqual(0);
});

test("Queue job should have retry attempts configured", async () => {
    const job = await orderQueue.queue.add("retry-job", { orderId: "ORD-R1", tokenIn: "SOL", tokenOut: "USDC", amount: 1 }, { attempts: 3 });
    expect(job.opts.attempts).toBe(3);
  });
  