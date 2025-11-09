# Order Execution Engine (Mock Implementation)

##  Overview

This project implements a **Market Order Execution Engine** with real-time WebSocket updates, concurrent queue processing, and DEX routing between **Raydium** and **Meteora** (mocked).
It is built using **Node.js, TypeScript, Fastify, BullMQ, Redis, and PostgreSQL**.

---

## Tech Stack

| Component        | Technology                                |
| ---------------- | ----------------------------------------- |
| Server           | Node.js + TypeScript                      |
| Framework        | Fastify                                   |
| Queue            | BullMQ + Redis                            |
| Database         | PostgreSQL (TypeORM)                      |
| WebSockets       | @fastify/websocket                        |
| DEX Router       | Mock implementation for Raydium & Meteora |
| Containerization | Docker (Redis + Postgres)                 |

---

##  Chosen Order Type — Market Order

This engine implements **Market Orders**, which execute immediately at the current market price.
It can easily be extended to support:

* **Limit Orders** → add price threshold validation before execution.
* **Sniper Orders** → trigger execution based on token launch or external events.

---

##  Features

REST API for order submission (`POST /api/orders/execute`)
WebSocket updates for real-time order status
DEX router that selects the best quote (Raydium vs Meteora)
BullMQ queue for concurrent order processing (10 at once)
Retry with exponential backoff on failures
PostgreSQL persistence for every order and status change
Clear modular code structure (routes, services, utils)

---

##  Architecture Overview

```
Client (Postman/WebSocket)
        │
        ▼
Fastify Server
  ├── /api/orders/execute      → Create order & enqueue job
  ├── /api/orders/updates/:id  → WebSocket live updates
  │
  ▼
BullMQ Worker (Redis)
  ├── Processes up to 10 orders concurrently
  ├── Retries failed jobs (3x exponential backoff)
  │
  ▼
Mock DEX Router
  ├── Fetches quotes from Raydium & Meteora
  ├── Selects best price/liquidity
  ├── Simulates transaction execution
  │
  ▼
PostgreSQL (TypeORM)
  ├── Persists orders + statuses
  └── Enables order history retrieval
```

---

##  Order Lifecycle

| Stage       | Description                                  |
| ----------- | -------------------------------------------- |
| `pending`   | Order received and queued                    |
| `routing`   | Comparing prices between Raydium and Meteora |
| `best_dex`  | Selected DEX and best price identified       |
| `building`  | Preparing transaction                        |
| `submitted` | Simulating on-chain submission               |
| `confirmed` | Execution successful (includes txHash & DEX) |
| `failed`    | Any failure (with error reason)              |

---

##  Project Structure

```
src/
├── config/
│   └── db.ts               # PostgreSQL setup (TypeORM)
├── entities/
│   └── Order.ts            # Order entity schema
├── routes/
│   ├── pingRoute.ts
│   └── orderRoute.ts       # REST + WebSocket routes
├── services/
│   ├── MockDexRouter.ts    # Mock DEX routing logic
│   ├── OrderQueue.ts       # BullMQ queue and worker
│   └── webSocketManager.ts # Manages client connections
├── utils/
│   ├── helpers.ts          # sleep(), generateOrderId(), etc.
│   └── types.ts
└── index.ts                # Fastify server entrypoint
```

---

##  Setup Instructions

### 1️ Clone & Install

```bash
git clone <your_repo_url>
cd order-engine
npm install
```

### 2️ Start Redis & PostgreSQL (Docker)

```bash
docker run -d --name redis-server -p 6379:6379 redis
docker run -d --name postgres-db -p 5432:5432 -e POSTGRES_PASSWORD=yash postgres
```

### 3️ Create Database

```bash
docker exec -it postgres-db psql -U postgres
CREATE DATABASE order_engine;
\q
```

### 4️ Run the Server

```bash
npm run dev
```

 You should see:

```
 PostgreSQL connected successfully
Server running on http://localhost:3000
```

---

##  API Usage

###  Create Order

**POST** `/api/orders/execute`

```json
{
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amount": 1.5
}
```

**Response**

```json
{
  "success": true,
  "message": "Order received successfully",
  "orderId": "ORD-ABC123"
}
```

---

###  WebSocket Updates

**Connect to:**
`ws://localhost:3000/api/orders/updates/ORD-ABC123`

You’ll receive messages like:

```json
{ "status": "pending" }
{ "status": "routing" }
{ "status": "best_dex", "dex": "Raydium", "price": 101.24 }
{ "status": "building" }
{ "status": "submitted" }
{ "status": "confirmed", "txHash": "0x5D533250", "dex": "Raydium" }
```

---

## Database Schema (TypeORM → PostgreSQL)

| Column      | Type      | Description             |
| ----------- | --------- | ----------------------- |
| `id`        | int       | Primary key             |
| `orderId`   | string    | Unique identifier       |
| `tokenIn`   | string    | Source token            |
| `tokenOut`  | string    | Target token            |
| `amount`    | decimal   | Swap amount             |
| `dex`       | string    | Chosen DEX              |
| `txHash`    | string    | Transaction hash        |
| `status`    | string    | Current order status    |
| `error`     | string    | Failure reason (if any) |
| `createdAt` | timestamp | Auto                    |
| `updatedAt` | timestamp | Auto                    |

---

##  Queue Configuration

* Queue Name: `orders`
* Concurrency: `10`
* Retry Attempts: `3`
* Backoff: Exponential (2s, 4s, 8s)

---

##  Logging & Debugging

* All DEX routing and status updates appear in the console.
* Failed jobs log the reason and retry automatically.
* Completed orders persist in PostgreSQL.

---

##  Testing

**Testing Framework:** Jest

Test cases include:

* API validation and responses
* Order queue behavior
* Routing logic correctness
* WebSocket lifecycle updates
* Error handling & retry mechanism
* Database persistence and updates

Run tests:

```bash
npm test
```

---


Backend: Fastify + BullMQ + PostgreSQL
Mock DEX routing between Raydium & Meteora
