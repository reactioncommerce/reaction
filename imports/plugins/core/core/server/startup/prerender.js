import Logger from "@reactioncommerce/logger";
import prerender from "prerender-node";
import { WebApp } from "meteor/webapp";

export default function preRender() {
  if (process.env.PRERENDER_TOKEN && process.env.PRERENDER_HOST) {
    prerender.set("prerenderToken", process.env.PRERENDER_TOKEN);
    prerender.set("host", process.env.PRERENDER_HOST);
    prerender.set("protocol", "https");
    WebApp.rawConnectHandlers.use(prerender);
    Logger.info("Prerender Initialization finished.");
  }
}
