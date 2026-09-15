import { redis } from "./client.js";

const PRESENCE_KEY = "presence";
const HEARTBEAT_TIMEOUT = 30;

export const heartbeat = async (userId: number) => {
    const expiresAt =
        Math.floor(Date.now() / 1000) + HEARTBEAT_TIMEOUT;

    await redis.zAdd(PRESENCE_KEY, {
        score: expiresAt,
        value: `user:${userId}`,
    });

    return {
        expiresAt,
    };
};
export const getOnlineUsers = async () => {
    const currentTime = Math.floor(
        Date.now() / 1000,
    );

    return redis.zRangeByScore(
        PRESENCE_KEY,
        currentTime,
        "+inf",
    );
};

export const isUserOnline = async (userId: number) => { const score = await redis.zScore(PRESENCE_KEY, `user:${userId}`,); if (score === null) { return false; } const currentTime = Math.floor(Date.now() / 1000,); return score > currentTime; };