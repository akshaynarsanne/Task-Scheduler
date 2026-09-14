import type { FastifyInstance } from "fastify";
import {
  createuser,
  getUserById,
} from "../services/user.service.js";

export const userRoutes = async (app: FastifyInstance) => {
  app.post("/users", async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
    };

    const user = await createuser(
      body.name,
      body.email,
    );

    return reply.status(201).send(user);
  });

  app.get("/users/:id", async (request, reply) => {
    const params = request.params as {
      id: string;
    };

    const user = await getUserById(
      Number(params.id),
    );

    if (!user) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    return user;
  });
};