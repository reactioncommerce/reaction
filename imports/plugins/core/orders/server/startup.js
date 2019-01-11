import appEvents from "/imports/node-app/core/util/appEvents";
import sendOrderEmail from "/imports/plugins/core/orders/server/util/sendOrderEmail";

appEvents.on("afterOrderCreate", (order) => sendOrderEmail(order));
