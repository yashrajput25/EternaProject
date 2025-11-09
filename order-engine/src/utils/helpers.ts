export function generateOrderId() {
    return "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
  
export function generateMockTxHash() {
    return "0x" + Math.random().toString(16).substring(2, 10).toUpperCase();
}
  