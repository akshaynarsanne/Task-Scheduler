import type { FastifyInstance } from "fastify";
import {
  createuser,
  getUserById,
  updateUser,
} from "../services/user.service.js";
import {
  deleteCachedUser,
  getCachedUser,
  setCachedUser,
} from "../redis/user-cache.js";
import {
  acquireLock,
  releaseLock,
} from "../redis/lock.js";
import { waitForCache } from "../redis/cache-wait.js";
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

  const userId = Number(params.id);

  // 1. Check Redis cache
  const cachedUser = await getCachedUser(userId);

  if (cachedUser) {
    console.log(
      `[CACHE HIT] user:${userId}`,
    );

    return JSON.parse(cachedUser);
  }

  console.log(
    `[CACHE MISS] user:${userId}`,
  );

  // 2. Try to acquire the lock
  const lockToken = await acquireLock(
    `user:${userId}`,
  );

  if (!lockToken) {
  const retryCachedUser =
    await waitForCache(() =>
      getCachedUser(userId),
    );

  if (retryCachedUser) {
    console.log(
      `[CACHE HIT AFTER WAIT] user:${userId}`,
    );

    return JSON.parse(retryCachedUser);
  }

  return reply.status(503).send({
    message:
      "User is currently being loaded. Please retry.",
  });
}

  try {
    // 3. Double-check Redis after acquiring lock
    const cachedUserAfterLock =
      await getCachedUser(userId);

    if (cachedUserAfterLock) {
      return JSON.parse(cachedUserAfterLock);
    }

    // 4. Query database
    const user = await getUserById(userId);

    if (!user) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    // 5. Populate Redis
    await setCachedUser(
      userId,
      JSON.stringify(user),
    );

    return user;
  } finally {
    // 6. Always release our lock
    await releaseLock(
      `user:${userId}`,
      lockToken,
    );
  }
});

  app.put("/users/:id", async (request, reply) => {
    const params = request.params as {
      id: string;
    };

    const userId = Number(params.id);

    const body = request.body as {
      name: string;
      email: string;
    };

    const user = await updateUser(
      userId,
      body.name,
      body.email
    );

    if (!user) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    // Update the cache with the new user data
    await deleteCachedUser(userId);
    return user;
  });
};