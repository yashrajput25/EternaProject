import "reflect-metadata";
import { DataSource } from "typeorm";
import { Order } from "../entities/Order";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "host.docker.internal",
  port: 5432,
  username: "postgres",
  password: "yash",   // change this
  database: "order_engine",
  synchronize: true,           // auto creates tables (good for dev)
  logging: false,
  entities: [Order, __dirname + "/../entities/*.js"], 
});

export async function initDB() {
  try {
    await AppDataSource.initialize();
    console.log("✅ PostgreSQL connected successfully");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}
