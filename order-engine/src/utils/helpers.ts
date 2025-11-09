export function generateOrderId() {
    return "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}
