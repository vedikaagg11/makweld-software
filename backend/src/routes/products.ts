import { FastifyInstance } from "fastify";
import { pool } from "../db.js";
import { authenticate } from "../authGuard.js";

export default async function productRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: authenticate,
    },
    async () => {
      const result = await pool.query(`
        SELECT
          id,
          name,
          sku,
          price,
          stock_quantity,
          is_active,
          created_at,
          updated_at
        FROM products
        ORDER BY name ASC
      `);

      return result.rows;
    },
  );

  app.post(
    "/",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        sku: string;
        price: number;
        stock_quantity?: number;
      };

      if (!body.name || !body.sku || body.price === undefined) {
        return reply.code(400).send({
          error: "Name, SKU and price are required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO products (
          name,
          sku,
          price,
          stock_quantity
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          body.name.trim(),
          body.sku.trim(),
          body.price,
          body.stock_quantity ?? 0,
        ],
      );

      return reply.code(201).send(result.rows[0]);
    },
  );
}