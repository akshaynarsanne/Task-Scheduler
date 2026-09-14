import {db} from "../db/index.js";
import { projects } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../redis/client.js";
export const createProject = async (
    name: string,
    ownerId: number
)  => {
    const [project] = await db
    .insert(projects)
    .values({
        name,
        ownerId,
    }).returning();
    return project;
};

export const getProjectById = async (id: number) => {
    
    // Check if the project is in the cache
    const cacheKey = `project:${id}`;
    const cachedProject = await redis.get(cacheKey);
    if (cachedProject) {
        console.log("CACHE HIT");
        return JSON.parse(cachedProject);
    }

    console.log("CACHE MISS");

    // If not in cache, fetch from the database
    const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

    if(!project) {
        return undefined;
    }

    // Store the project in the cache for future requests
    await redis.set(cacheKey, JSON.stringify(project), {
        EX: 60, // Set an expiration time of 1 hour (3600 seconds)
    });
    
    return project;
};

export const getProjectsByOwnerId = async (ownerId: number) => {
    const projectsList = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, ownerId));
    
    return projectsList;
};

export const updateProject = async (
  id: number,
  data: {
    name?: string;
  },
) => {
  const [project] = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, id))
    .returning();

  if (project) {
    await redis.del(`project:${id}`);
  }

  return project;
};