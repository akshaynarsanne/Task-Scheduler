import Fastify from "fastify";
import { db } from "./db/index.js";
import { userRoutes } from "./routes/user.routes.js";
import { projectRoutes } from "./routes/project.routes.js";
import { taskRoutes } from "./routes/task.routes.js";
import { connectRedis, redis } from "./redis/client.js";
import { rateLimitPlugin } from "./plugins/rate-limit.js";
const app = Fastify({
    logger: true,
});

app.register(rateLimitPlugin);
app.register(userRoutes);
app.register(projectRoutes);
app.register(taskRoutes);

app.get('/health',async ()=>{
    const result = await db.execute(`SELECT 1`);
    return {
        status:"ok",
        database : "connected",
        redis: "connected",
        result,
    };
});

const start = async () => {
    try {
        await connectRedis();
        await app.listen({
            port:3000,
            host:"0.0.0.0"
    });
    }catch(error){
        app.log.error(error);
        process.exit(1);
    };
};

start();