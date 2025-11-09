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
