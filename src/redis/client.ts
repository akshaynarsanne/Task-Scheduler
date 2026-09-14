import {createClient} from "redis";

export const redis = createClient({
    url : 'redis://localhost:6379',
});

redis.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    await redis.connect();
    console.log("Redis connected");
};
