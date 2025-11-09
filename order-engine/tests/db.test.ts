import { AppDataSource } from "../src/config/db";
import { Order } from "../src/entities/Order";

beforeAll(async () => { await AppDataSource.initialize(); });
afterAll(async () => { await AppDataSource.destroy(); });

test("Database saves order entry", async () => {
  const repo = AppDataSource.getRepository(Order);
  const order = repo.create({
    orderId: "ORD-DBTEST",
    tokenIn: "SOL",
    tokenOut: "USDC",
    amount: 1.5,
    status: "pending"
  });
  const saved = await repo.save(order);
  expect(saved.id).toBeDefined();
});

test("Database connection should be initialized", async () => {
    expect(AppDataSource.isInitialized).toBe(true);
  });
  
