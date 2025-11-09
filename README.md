# Order Execution Engine (Mock Implementation)

## Overview

This project implements a **Market Order Execution Engine** with real-time WebSocket updates, concurrent queue processing, and DEX routing between **Raydium** and **Meteora** (mocked). It is built using **Node.js, TypeScript, Fastify, BullMQ, Redis, and PostgreSQL**.

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
| Deployment       | Render                                    |

---

## Order Type Chosen — Market Order

The engine implements **Market Orders**, which execute immediately at the best available market price.

### Why Market Orders?

Market Orders are the most direct way to demonstrate the **core system architecture** — from queue management and routing to live WebSocket updates. Since they execute instantly, they simplify validation of order flow and concurrency while maintaining realistic DEX behavior.

### How Other Orders Can Be Added

* **Limit Orders** → Add a price-check condition before execution (execute only when market price ≥ target price).
* **Sniper Orders** → Extend with event triggers (e.g., token launch or liquidity pool creation).

---

## Branching Strategy

The repository uses **two branches**:

* **`main`** → Development branch containing local setup and test configurations.
* **`deployed_branch`** → Deployment-ready branch hosted on **Render**, containing environment configurations and optimizations for cloud runtime.

All deployment-related fixes, `.env` integrations, and Redis/PostgreSQL cloud connections are managed within `deployed_branch`.

---

## Features

* REST API for order submission (`POST /api/orders/execute`)
* WebSocket updates for live order statuses
* DEX router that picks the best price between Raydium & Meteora
* BullMQ queue with 10 concurrent workers
* Automatic retries (3 attempts, exponential backoff)
* PostgreSQL persistence for all order data
* Modular, maintainable architecture

---

## Architecture Overview

```
Client (Postman/WebSocket)
        │
        ▼
Fastify Server
  ├── /api/orders/execute      → Create order & enqueue job
  ├── /api/orders/updates/:id  → WebSocket updates
  │
  ▼
BullMQ Worker (Redis)
  ├── Handles 10 concurrent orders
  ├── Retries failed jobs (3x)
  │
  ▼
Mock DEX Router
  ├── Fetches Raydium & Meteora quotes
  ├── Selects best price
  ├── Simulates transaction
  │
  ▼
PostgreSQL (TypeORM)
  ├── Persists orders
  └── Enables history retrieval
```

---

## Order Lifecycle

| Stage       | Description                                  |
| ----------- | -------------------------------------------- |
| `pending`   | Order received and queued                    |
| `routing`   | Comparing prices between Raydium & Meteora   |
| `best_dex`  | Selected DEX and best price identified       |
| `building`  | Preparing transaction                        |
| `submitted` | Simulating on-chain submission               |
| `confirmed` | Execution successful (includes txHash & DEX) |
| `failed`    | Any failure (with error reason)              |

---

## Project Structure

```
src/
├── config/
│   └── db.ts               # PostgreSQL setup (TypeORM)
├── entities/
│   └── Order.ts            # Order schema
├── routes/
│   ├── pingRoute.ts
│   └── orderRoute.ts       # REST + WebSocket endpoints
├── services/
│   ├── MockDexRouter.ts    # Mock DEX router
│   ├── OrderQueue.ts       # Queue + Worker logic
│   └── webSocketManager.ts # WebSocket client updates
├── utils/
│   ├── helpers.ts          # sleep(), random IDs, etc.
│   └── types.ts
└── index.ts                # Fastify entrypoint
```

---

## Setup Instructions

### 1️ Clone & Install

```bash
git clone <your_repo_url>
cd order-engine
npm install
```

### 2️ Environment Variables

Create a `.env` file with your cloud credentials:

```bash
POSTGRES_HOST=dpg-xxxx.a
POSTGRES_USER=order_engine_db_user
POSTGRES_PASSWORD=xxxxxx
POSTGRES_DB=order_engine_db
POSTGRES_PORT=5432

UPSTASH_REDIS_REST_URL=https://above-python-28775.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

### 3️ Start Redis & PostgreSQL Locally (Optional)

```bash
docker run -d --name redis-server -p 6379:6379 redis
docker run -d --name postgres-db -p 5432:5432 -e POSTGRES_PASSWORD=yash postgres
```

### 4️ Run the Server

```bash
npm run dev
```

You should see:

```
 DB ready for OrderQueue
 PostgreSQL connected successfully
 Server running on http://localhost:3000
```

---

## API Usage

### Create Order

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

### WebSocket Updates

**Connect to:** `ws://localhost:3000/api/orders/updates/ORD-ABC123`

Messages received:

```json
{ "status": "pending" }
{ "status": "routing" }
{ "status": "best_dex", "dex": "Raydium", "price": 101.24 }
{ "status": "building" }
{ "status": "submitted" }
{ "status": "confirmed", "txHash": "0x5D533250", "dex": "Raydium" }
```

---

## Queue Configuration

* Queue Name: `orders`
* Concurrency: `10`
* Retry Attempts: `3`
* Backoff: Exponential (2s, 4s, 8s)

---

## Testing

**Testing Framework:** Jest

Tests cover:

* API validation and responses
* Queue behavior and retry
* DEX routing correctness
* WebSocket lifecycle
* Database persistence

```bash
npm test
```

---

### Summary

* **Order Type:** Market Order — executes immediately at best price.
* **Routing:** Raydium vs Meteora (mocked quotes).
* **Queue:** BullMQ with exponential retry.
* **WebSocket:** Real-time lifecycle tracking.
* **Branches:** `main` for development, `deployed_branch` for deployment.

