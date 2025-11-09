import { WebSocket } from "ws";

// Map of orderId → WebSocket
const clients = new Map<string, WebSocket>();

export function registerClient(orderId: string, socket: WebSocket) {
    clients.set(orderId, socket);
    console.log(`🔗 WebSocket registered for order ${orderId}`);
    }

export function removeClient(orderId: string) {
    clients.delete(orderId);
    console.log(`❌ WebSocket removed for order ${orderId}`);
    }

export function sendUpdate(orderId: string, message: any) {
    const socket = clients.get(orderId);
    if (socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(message));
    }
}
