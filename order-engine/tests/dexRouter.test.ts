import MockDexRouter from "../src/services/MockDexRouter";

const router = new MockDexRouter();

test("DEX router returns best quote", async () => {
  const result = await router.getBestQuote({
      tokenIn: "SOL", tokenOut: "USDC", amount: 1,
      orderId: ""
  });
  expect(["Raydium", "Meteora"]).toContain(result.dex);
  expect(result.price).toBeGreaterThan(0);
});
