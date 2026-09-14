import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const createTask = async (
  projectId: number,
  title: string,
  description?: string,
  priority: number = 0,
) => {
  const [task] = await db
    .insert(tasks)
    .values({
      projectId,
      title,
      description,
      priority,
    })
    .returning();

  return task;
};

export const getTaskById = async (id: number) => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id));

  return task;
};

export const getTasksByProjectId = async (
  projectId: number,
) => {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId));
};

export const updateTask = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    priority?: number;
  },
) => {
  const [task] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, id))
    .returning();

  return task;
};

export const deleteTask = async (id: number) => {
  const [task] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();

  return task;
};