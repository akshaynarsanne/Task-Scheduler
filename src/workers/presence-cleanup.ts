import { redis } from "../redis/client.js";

const PRESENCE_KEY = "presence";
const CLEANUP_INTERVAL = 10_000; // Cleanup every 10 seconds



export const cleanupPresence = async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const removed = await redis.zRemRangeByScore(PRESENCE_KEY, "-inf", currentTime,);

    console.log(`[Presence Cleanup] Removed ${removed} expired users`,);
};

export const startPresenceCleanup = () => { 
    console.log(
        "[Presence Cleanup] Worker started",
    );
    setInterval(async () => {
        try { await cleanupPresence();

        } catch (error) {
            console.error("[Presence Cleanup] Failed:", error,); 
        }
    }, CLEANUP_INTERVAL);
};