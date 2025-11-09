import request from "supertest";
import { buildServer } from "./setup";

let app: any;

beforeAll(async () => {
  app = await buildServer();
});

afterAll(async () => {
  await app.close();
});

describe("Order API", () => {
  it("✅ POST /api/orders/execute returns orderId", async () => {
    const response = await request(app.server)
      .post("/api/orders/execute")
      .send({ tokenIn: "SOL", tokenOut: "USDC", amount: 1.2 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("orderId");
  });

  it("❌ Missing params returns 400", async () => {
    const response = await request(app.server)
      .post("/api/orders/execute")
      .send({});
    expect(response.status).toBe(400);
  });
});

it("GET /api/orders/history should return array", async () => {
    const response = await request(app.server).get("/api/orders/history");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  