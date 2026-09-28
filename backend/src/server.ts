import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import jwt from "@fastify/jwt";
import { authenticate } from "./authGuard.js";


dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.register(authRoutes, {
  prefix: "/api/auth",
});

app.register(productRoutes, {
  prefix: "/api/products",
});

app.register(jwt, {
  secret: process.env.JWT_SECRET!,
});

app.get("/health", async () => {
  const result = await pool.query("SELECT NOW()");

  return {
    status: "ok",
    database: "connected",
    time: result.rows[0].now,
  };
});

app.get(
  "/api/protected",
  {
    preHandler: authenticate,
  },
  async (request) => {
    return {
      message: "You are authenticated",
      user: request.user,
    };
  },
);

const start = async () => {
  try {
    await pool.query("SELECT 1");

    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });

    console.log("Makweld backend is running");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();