import type { FastifyInstance } from "fastify";
import {
  createProject,
  getProjectById,
  getProjectsByOwnerId,
  updateProject,
} from "../services/project.service.js";

export const projectRoutes = async (app: FastifyInstance) => {
  app.post("/users/:userId/projects", async (request, reply) => {
    const params = request.params as {
      userId: string;
    };

    const body = request.body as {
      name: string;
    };

    const project = await createProject(
      body.name,
      Number(params.userId),
    );

    return reply.status(201).send(project);
  });

  app.get("/projects/:id", async (request, reply) => {
    const params = request.params as {
      id: string;
    };

    const project = await getProjectById(
      Number(params.id),
    );

    if (!project) {
      return reply.status(404).send({
        message: "Project not found",
      });
    }

    return project;
  });

  app.get("/users/:userId/projects", async (request) => {
    const params = request.params as {
      userId: string;
    };

    return getProjectsByOwnerId(
      Number(params.userId),
    );
  });
  app.patch("/projects/:id", async (request, reply) => {
  const params = request.params as {
    id: string;
  };

  const body = request.body as {
    name?: string;
  };

  const project = await updateProject(
    Number(params.id),
    body,
  );

  if (!project) {
    return reply.status(404).send({
      message: "Project not found",
    });
  }

  return project;
});
};