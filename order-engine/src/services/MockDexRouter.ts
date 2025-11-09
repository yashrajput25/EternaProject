// src/services/MockDexRouter.ts


import { sleep, generateMockTxHash } from "../utils/helpers";




export interface Quote {
  price: number;
  fee: number;
  dex: string;
}

export interface Order {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}




export default class MockDexRouter {
  basePrice: number;

  constructor() {
    this.basePrice = 100; // just a fake base price
  }




  async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
    await sleep(200); // simulate network delay
    return {
      price: this.basePrice * (0.98 + Math.random() * 0.04), // ±2%
      fee: 0.003,
      dex: "Raydium",
    };
  }




  async getMeteoraQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
    await sleep(200);
    return {
      price: this.basePrice * (0.97 + Math.random() * 0.05), // ±3%
      fee: 0.002,
      dex: "Meteora",
    };
  }




  async getBestQuote(order: Order): Promise<Quote> {
    const [rQuote, mQuote] = await Promise.all([
      this.getRaydiumQuote(order.tokenIn, order.tokenOut, order.amount),
      this.getMeteoraQuote(order.tokenIn, order.tokenOut, order.amount),
    ]);
    return rQuote.price > mQuote.price ? rQuote : mQuote;
  }





  async executeSwap(order: Order, dex: string) {
    await sleep(2000 + Math.random() * 1000); //mock delay
    return {
      txHash: generateMockTxHash(), //kind of a reciept for our trade or transaction
      executedPrice: this.basePrice * (0.97 + Math.random() * 0.05),
      dex,
    };
  }
}
