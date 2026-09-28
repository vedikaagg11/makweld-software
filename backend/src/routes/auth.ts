import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

export default async function authRoutes(app: FastifyInstance) {
  // Register
  app.post("/register", async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
      password: string;
      role?: "admin" | "employee";
    };

    if (!body.name || !body.email || !body.password) {
      return reply.code(400).send({
        error: "Name, email and password are required",
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, is_active, created_at
      `,
      [
        body.name,
        body.email.toLowerCase().trim(),
        passwordHash,
        body.role ?? "employee",
      ],
    );

    return reply.code(201).send(result.rows[0]);
  });

  // Login
  app.post("/login", async (request, reply) => {
    const body = request.body as {
      email: string;
      password: string;
    };

    if (!body.email || !body.password) {
      return reply.code(400).send({
        error: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, email, password_hash, role, is_active
      FROM users
      WHERE email = $1
      `,
      [body.email.toLowerCase().trim()],
    );

    if (result.rows.length === 0) {
      return reply.code(401).send({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return reply.code(403).send({
        error: "Account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(
      body.password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return reply.code(401).send({
        error: "Invalid email or password",
      });
    }

    const token = await app.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
    });

    return {
    message: "Login successful",
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    },
    };
  });
}