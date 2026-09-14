import type { FastifyInstance } from "fastify";
import {
  createTask,
  getTaskById,
  getTasksByProjectId,
  updateTask,
  deleteTask,
} from "../services/task.service.js";

export const taskRoutes = async (app: FastifyInstance) => {
  app.post(
    "/projects/:projectId/tasks",
    async (request, reply) => {
      const params = request.params as {
        projectId: string;
      };

      const body = request.body as {
        title: string;
        description?: string;
        priority?: number;
      };

      const task = await createTask(
        Number(params.projectId),
        body.title,
        body.description,
        body.priority,
      );

      return reply.status(201).send(task);
    },
  );

  app.get(
    "/projects/:projectId/tasks",
    async (request) => {
      const params = request.params as {
        projectId: string;
      };

      return getTasksByProjectId(
        Number(params.projectId),
      );
    },
  );

  app.get("/tasks/:id", async (request, reply) => {
    const params = request.params as {
      id: string;
    };

    const task = await getTaskById(
      Number(params.id),
    );

    if (!task) {
      return reply.status(404).send({
        message: "Task not found",
      });
    }

    return task;
  });

  app.patch("/tasks/:id", async (request, reply) => {
    const params = request.params as {
      id: string;
    };

    const body = request.body as {
      title?: string;
      description?: string;
      priority?: number;
    };

    const task = await updateTask(
      Number(params.id),
      body,
    );

    if (!task) {
      return reply.status(404).send({
        message: "Task not found",
      });
    }

    return task;
  });

  app.delete("/tasks/:id", async (request, reply) => {
    const params = request.params as {
      id: string;
    };

    const task = await deleteTask(
      Number(params.id),
    );

    if (!task) {
      return reply.status(404).send({
        message: "Task not found",
      });
    }

    return {
      message: "Task deleted",
    };
  });
};