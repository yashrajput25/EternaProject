import "reflect-metadata";
import { DataSource } from "typeorm";
import { Order } from "../entities/Order";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "host.docker.internal",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "yash",
  database: process.env.POSTGRES_DB || "order_engine",
  synchronize: true,
  logging: false,
  entities: [Order],
  ssl: {
    rejectUnauthorized: false, // ✅ Render requires SSL, this ensures smooth connection
  },
});

export async function initDB() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ PostgreSQL connected successfully");
    }
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}
