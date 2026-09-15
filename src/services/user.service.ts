import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const createuser = async (
  name: string,
  email: string,
) => {
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
    })
    .returning();

  return user;
};

export const getUserById = async (id: number) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
};

export const updateUser = async (
  id: number,
  name: string,
  email: string,
) => {
  
  const [user] = await db
    .update(users)
    .set({
      name,
      email,
    })
    .where(eq(users.id, id))
    .returning();

  return user;
};