import { redis } from "./client.js";

const USER_CACHE_TTL = 60 * 5;

export const getCachedUser = async (userId: number,) => {
    return await redis.get(`user:${userId}`);
};
export const setCachedUser = async (
    userId: number,
    userData: string,
) => {
    return await redis.set(
        `user:${userId}`,
        userData, { EX: USER_CACHE_TTL, },
    );
};
export const deleteCachedUser = async (userId: number,) => {
    return await redis.del(`user:${userId}`);
};