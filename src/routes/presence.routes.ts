    import type { FastifyInstance } from "fastify";

import {
  heartbeat,
  isUserOnline,
  getOnlineUsers,
} from "../redis/presence.js";

export const presenceRoutes = async (
  app: FastifyInstance,
) => {
  // Check whether a specific user is currently online
  app.get(
    "/users/:userId/online",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      const online = await isUserOnline(
        Number(userId),
      );

      return {
        userId,
        online,
      };
    },
  );

  // Get all currently online users
  app.get("/users/online", async () => {
    const users = await getOnlineUsers();

    return {
      users,
    };
  });

  // Refresh user's presence
  app.post(
    "/users/:userId/heartbeat",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      const result = await heartbeat(
        Number(userId),
      );

      return {
        userId,
        ...result,
      };
    },
  );
};