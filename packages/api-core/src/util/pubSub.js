import redis from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = redis.createClient({ url: redisUrl });

redisClient.on("error", (err) => console.error("[RedisClient] Error:", err));

redisClient.connect();

/**
 * Publish an event to Redis Pub/Sub
 */
export function publishEvent(eventType, payload) {
  redisClient.publish(eventType, JSON.stringify(payload));
}

/**
 * Subscribe to events in Redis
 */
export function subscribeEvent(eventType, handler) {
  const subscriber = redisClient.duplicate();
  subscriber.connect().then(() => {
    subscriber.subscribe(eventType, (message) => {
      handler(JSON.parse(message));
    });
  });
}
