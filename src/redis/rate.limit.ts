import {redis} from "./client.js";

const WINDOW_SECONDS = 60; // 1 minute
const MAX_REQUESTS = 5; // Max requests per window


export const checkRateLimit = async (ip: string) => {
    const key = `rate_limit:${ip}`;

    const count = await redis.incr(key);

    if (count === 1) {
        await redis.expire(key, WINDOW_SECONDS);
    }

    return {
        allowed: count <= MAX_REQUESTS,
        remaining: Math.max(0, MAX_REQUESTS - count),
        count,
    };
};