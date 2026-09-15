import { redis }  from './client.js';
import crypto from "node:crypto";


const LOCK_TTL = 10;

export const acquireLock = async (key: string) => {
    const token = crypto.randomUUID();
    const result = await redis.set(
        `lock:${key}`,
        token,
        { NX: true, EX: LOCK_TTL },
    );
    
    if (result != "OK") { 
        return null;
    }
    return token;
}

export const releaseLock = async (key: string, token: string) => {
    const script = ` if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end `; return await redis.eval(script, { keys: [`lock:${key}`], arguments: [token], });
}
