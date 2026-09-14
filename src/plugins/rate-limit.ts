import type { FastifyInstance } from "fastify";
import { checkRateLimit } from "../redis/rate.limit.js";
import fp from "fastify-plugin";
export const rateLimitPlugin = async (
  app: FastifyInstance,
) => {
  app.addHook("onRequest", async (request, reply) => {
    console.log("RATE LIMIT HOOK:", request.url);
    const ip = request.ip;

    const result = await checkRateLimit(ip);

    reply.header(
      "X-RateLimit-Limit",
      "5",
    );

    reply.header(
      "X-RateLimit-Remaining",
      result.remaining.toString(),
    );

    if (!result.allowed) {
      return reply.status(429).send({
        message: "Too many requests",
      });
    }
  });
};

export default fp(rateLimitPlugin);