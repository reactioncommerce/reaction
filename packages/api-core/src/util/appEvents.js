import Logger from "@reactioncommerce/logger";
import SimpleSchema from "simpl-schema";
import { publishEvent } from "./pubSub"; // Import Redis Pub/Sub

// Define schemas for validation
const eventSchemas = {
  "orderCreated": new SimpleSchema({ orderId: String, userId: String, totalAmount: Number }),
  "userRegistered": new SimpleSchema({ userId: String, email: String })
};

async function synchronousPromiseLoop(name, funcs, args) {
  const func = funcs.shift();
  try {
    await func(...args);
  } catch (error) {
    Logger.error(`Error in "${name}" consumer`, error);
  }
  if (funcs.length) {
    await synchronousPromiseLoop(name, funcs, args);
  }
}

class AppEvents {
  constructor() {
    this.handlers = {};
    this.stopped = false;
  }

  resume() {
    this.stopped = false;
  }

  stop() {
    this.stopped = true;
  }

  async emit(name, ...args) {
    if (this.stopped || !this.handlers[name]) return;

    // Validate event arguments if a schema exists
    if (eventSchemas[name]) {
      const validationContext = eventSchemas[name].newContext();
      validationContext.validate(args[0]);

      if (!validationContext.isValid()) {
        Logger.error(`Validation failed for event "${name}":`, validationContext.validationErrors());
        return;
      }
    }

    // Publish event to Redis Pub/Sub
    publishEvent(name, args[0]);

    // Execute local handlers
    await synchronousPromiseLoop(name, this.handlers[name].slice(0), args);
  }

  on(name, func) {
    if (!this.handlers[name]) {
      this.handlers[name] = [];
    }
    this.handlers[name].push(func);
  }
}

export default new AppEvents();
export { AppEvents }; 