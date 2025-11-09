import WebSocket from "ws";

test("WebSocket connection established", done => {
  const ws = new WebSocket("ws://localhost:3000/api/orders/updates/ORD-TEST");
  ws.on("open", () => { ws.close(); done(); });
  ws.on("error", err => done(err));
});
